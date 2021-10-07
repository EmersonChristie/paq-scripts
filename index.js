var htmlToImage = require("html-to-image");
var download = require("downloadjs");

function renderImage(document) {
  console.log("rendering image");
  htmlToImage
    .toPng(document.getElementById("my-node"))
    .then(function (dataUrl) {
      console.log("data url: ", dataUrl);
      download(dataUrl, "my-node.png");
    });
}

const html = `<html lang="en">
<head>
</head>
<body>
  <div
    id="my-node"
    style="
      display: flex;
      align-items: center;
      width: 100%;
      height: 100vh;
      justify-content: center;
    "
  >
    <h1
      style="color: rgb(206, 192, 192); text-align: cneter; font-size: 60px"
    >
      This is a test!
    </h1>
  </div>
</body>
</html>`;
