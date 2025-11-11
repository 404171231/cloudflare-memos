/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 * http://127.0.0.1:8787/memos.api.v1.WorkspaceService/GetWorkspaceProfile
 */

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		
		// 转发 API 请求到后端服务器
		if (url.pathname.startsWith('/memos.api.v1.')) {
			const targetUrl = `http://yps.aotbot.com:5230${url.pathname}${url.search}`;
			
			const modifiedRequest = new Request(targetUrl, {
				method: request.method,
				headers: request.headers,
				body: request.body,
			});
			
			return fetch(modifiedRequest);
		}
		
		// 尝试获取静态资源
		try {
			const response = await env.ASSETS.fetch(request);
			
			// 如果找到静态资源，直接返回
			if (response.status !== 404) {
				return response;
			}
			
			// 如果是静态资源扩展名但找不到文件，返回 404
			const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.woff', '.woff2', '.ttf', '.ico', '.json', '.xml'];
			if (staticExtensions.some(ext => url.pathname.endsWith(ext))) {
				return response;
			}
			
			// 对于其他 404（如 /explore），返回 index.html 让前端路由处理
			return env.ASSETS.fetch(new URL('/', request.url));
		} catch (e) {
			// 如果获取资源失败，返回 index.html
			return env.ASSETS.fetch(new URL('/', request.url));
		}
	},
};
