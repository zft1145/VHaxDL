export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // GET /api/link
        if (path === '/api/link' && request.method === 'GET') {
            const link = await env.LINK_KV.get('target_url');
            return Response.json({ url: link || '' });
        }

        // PUT /api/link
        if (path === '/api/link' && request.method === 'PUT') {
            try {
                const { url } = await request.json();
                if (!url) return Response.json({ error: '缺少url' }, { status: 400 });
                await env.LINK_KV.put('target_url', url);
                return Response.json({ message: '保存成功' });
            } catch (e) {
                return Response.json({ error: '参数错误' }, { status: 400 });
            }
        }

        // 根路径：跳转
        return new Response(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>跳转中...</title></head>
<body>
    <p style="font-family:sans-serif;text-align:center;margin-top:40px;color:#666;">正在跳转...</p>
    <script>
        fetch('/api/link')
            .then(r => r.json())
            .then(data => {
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    document.body.innerHTML = '<p style="font-family:sans-serif;text-align:center;margin-top:40px;color:#999;">未设置跳转链接</p>';
                }
            })
            .catch(() => {
                document.body.innerHTML = '<p style="font-family:sans-serif;text-align:center;margin-top:40px;color:#c00;">加载失败</p>';
            });
    </script>
</body>
</html>`, { headers: { 'Content-Type': 'text/html' } });
    }
};
