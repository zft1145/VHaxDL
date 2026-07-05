export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // GET /api/link - 获取链接
        if (path === '/api/link' && request.method === 'GET') {
            const link = await env.LINK_KV.get('target_url');
            return Response.json({ url: link || '' });
        }

        // PUT /api/link - 修改链接
        if (path === '/api/link' && request.method === 'PUT') {
            try {
                const { url } = await request.json();
                if (!url) {
                    return Response.json({ error: '缺少url参数' }, { status: 400 });
                }
                await env.LINK_KV.put('target_url', url);
                return Response.json({ message: '保存成功' });
            } catch (error) {
                return Response.json({ error: '请求格式错误' }, { status: 400 });
            }
        }

        // GET /admin.html - 管理页面
        if (path === '/admin.html') {
            return new Response(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>链接管理</title>
</head>
<body>
    <h3>修改跳转链接</h3>
    <input id="url" placeholder="https://example.com" style="width:400px;padding:8px;">
    <button onclick="save()" style="padding:8px 20px;margin-left:10px;">保存</button>
    <p id="msg" style="margin-top:15px;"></p>
    
    <script>
        fetch('/api/link')
            .then(r => r.json())
            .then(data => {
                if (data.url) {
                    document.getElementById('url').value = data.url;
                }
            })
            .catch(() => {
                document.getElementById('msg').textContent = '加载当前链接失败';
            });

        function save() {
            const url = document.getElementById('url').value.trim();
            if (!url) {
                alert('请输入链接');
                return;
            }
            
            fetch('/api/link', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            })
            .then(r => r.json())
            .then(data => {
                if (data.message) {
                    document.getElementById('msg').textContent = '✅ ' + data.message;
                    document.getElementById('msg').style.color = 'green';
                } else if (data.error) {
                    document.getElementById('msg').textContent = '❌ ' + data.error;
                    document.getElementById('msg').style.color = 'red';
                }
            })
            .catch(() => {
                document.getElementById('msg').textContent = '❌ 保存失败，请重试';
                document.getElementById('msg').style.color = 'red';
            });
        }
    </script>
</body>
</html>`, {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        // 默认：跳转页面 (访问根路径)
        return new Response(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>跳转中...</title>
</head>
<body>
    <script>
        fetch('/api/link')
            .then(r => r.json())
            .then(data => {
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    document.body.textContent = '未设置链接';
                }
            })
            .catch(() => {
                document.body.textContent = '加载失败';
            });
    </script>
</body>
</html>`, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
}
