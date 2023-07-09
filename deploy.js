// 前端部署webhook - by chatgpt

const http = require("http");
const { exec } = require("child_process");

const PORT = 8087; // 设置服务器监听的端口号
const deployCommandTest =
  "cd /home/www/qjhAdmin && git pull && npm install && npm run build && cp -rf ./dist/* ../testsnsc/public/admin";
const deployCommandRelease =
  "cd /home/www/qjhAdmin && git pull && npm install && npm run build && cp -rf ./dist/* ../snsc/public/admin";

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/webhook") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        console.log(payload);
        // 验证 Webhook 请求，可以根据自己的需求进行验证
        const secret = "123123";
        const signature = req.headers["x-gitea-signature"];
        // 根据你使用的哈希算法，计算请求体的签名并与头部提供的签名进行比较
        // 这里假设你使用的是 HMAC-SHA256 算法
        const computedSignature = computeHmacSha256Signature(secret, body);
        const action = req.headers["X-Gitea-Event"];
        var deployCommand = "";
        if (action == "release") {
          console.log("发布正式");
          deployCommand = deployCommandRelease;
        } else {
          deployCommand = deployCommandTest;
        }
        if (signature !== computedSignature) {
          res.statusCode = 403; // 验证失败，返回 403 Forbidden 状态码
          res.end("Invalid signature");
          return;
        }

        // 验证通过，执行部署命令
        console.log("Deploying, command:" + deployCommand);
        exec(deployCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error deploying frontend: ${error.message}`);
            res.statusCode = 500; // 部署失败，返回 500 Internal Server Error 状态码
            res.end("Deployment failed");
          } else {
            console.log("Frontend deployed successfully");
            res.statusCode = 200; // 部署成功，返回 200 OK 状态码
            res.end("Deployment successful");
          }
        });
      } catch (error) {
        console.error(`Error parsing webhook payload: ${error.message}`);
        res.statusCode = 400; // 请求体解析失败，返回 400 Bad Request 状态码
        res.end("Invalid payload");
      }
    });
  } else {
    res.statusCode = 404; // 请求的路由不存在，返回 404 Not Found 状态码
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// 根据你使用的哈希算法，计算请求体的签名
function computeHmacSha256Signature(secret, data) {
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}
