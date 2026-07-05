export default {
    async fetch(request, env) {
        // 处理 CORS 跨域
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // 处理 OPTIONS 预检请求
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        // GET /api/link
        if (path === '/api/link' && request.method === 'GET') {
            try {
                const link = await env.LINK_KV.get('target_url');
                return Response.json({ url: link || '' }, { headers: corsHeaders });
            } catch (err) {
                return Response.json({ error: 'KV读取失败：' + err.message }, { 
                    status: 500,
                    headers: corsHeaders 
                });
            }
        }

        // PUT /api/link
        if (path === '/api/link' && request.method === 'PUT') {
            try {
                const body = await request.json();
                const link = body.url;
                if (!link) {
                    return Response.json({ error: '缺少url参数' }, { 
                        status: 400,
                        headers: corsHeaders 
                    });
                }
                await env.LINK_KV.put('target_url', link);
                return Response.json({ message: '保存成功' }, { headers: corsHeaders });
            } catch (err) {
                return Response.json({ error: '保存失败：' + err.message }, { 
                    status: 500,
                    headers: corsHeaders 
                });
            }
        }

        // 根路径：直接跳转
        if (path === '/') {
            try {
                const link = await env.LINK_KV.get('target_url');
                if (link) {
                    // 有链接直接 302 跳转
                    return Response.redirect(link, 302);
                } else {
                    return new Response(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>未设置链接</title></head>
<body style="font-family:sans-serif;text-align:center;padding-top:60px;">
    <h2>⚠️ 未设置跳转链接</h2>
    <p>请访问 <a href="/admin.html">/admin.html</a> 设置</p>
    <p style="color:#999;font-size:14px;">Worker 名称：vhaxdlapi</p>
</body>
</html>`, { headers: { 'Content-Type': 'text/html' } });
                }
            } catch (err) {
                return new Response('KV读取错误：' + err.message, { status: 500 });
            }
        }

        // 其他路径返回 404
        return new Response('404 Not Found', { status: 404 });
    }
};
