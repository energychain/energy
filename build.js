const fs = require("fs");
const marked = require("marked");
const path = require("path");

// Define the directory containing the Markdown files
const directory = "./STROMDAO_EAFs.wiki";

// Get all the Markdown files in the directory
const files = fs.readdirSync(directory);

// Create a directory for the HTML files
if(!fs.existsSync("./docs")) {
    fs.mkdirSync("./docs");
}

const template = fs.readFileSync("./template.html", "utf8");
const header = template.substring(0, template.indexOf("##INSERT_CODE##"));
const footer = template.substring(template.indexOf("##INSERT_CODE##") + 15);
const myfiles = [];
// Loop through the Markdown files
for (const file of files) {
  try {
  // Read the Markdown file
  const markdown = fs.readFileSync(path.join(directory, file), "utf8");
  // Extract the frontmatter using a regular expression
  const frontmatterRegex = /^(---\n[\s\S]*?\n---)/;
  const frontmatter = markdown.match(frontmatterRegex);
  if(frontmatter !== null) {
    console.log(frontmatter[0]);
  }

  // Remove the frontmatter from the Markdown
  let markdownWithoutFrontmatter = markdown.replace(frontmatterRegex, "");
  const regex = /^## (.*)/m;
  let title = file.replace(".md", "")
  const result = regex.exec(markdownWithoutFrontmatter);
  if(result !== null) {
    title = result[1];
  }
  //const regex = /^## (.*)/m;
  markdownWithoutFrontmatter= markdownWithoutFrontmatter.replace(regex, "");
  // Convert the Markdown to HTML
  const html = marked.parse(markdownWithoutFrontmatter);
  let updatedHtml = html.replace(/\[\[(.*?)\]\]/g, "<a href=\"./$1.html\">$1</a>");

  // Create an HTML file with the same name as the Markdown file
  const htmlFile = path.join("./docs", file.replace(".md", ".html"));
  myfiles.push( {
    file:"./docs/"+file.replace(".md", ".html"),
    title:title,
    url:"https://energy.js.org/docs/"+file.replace(".md", ".html")
  })

  
  let fullHTML = header + updatedHtml + footer;
  fullHTML= fullHTML.replace(/##TITLE##/g, title);

  // Write the HTML to the file
  fs.writeFileSync(htmlFile, fullHTML);

    } catch(e) {
        console.log(e);
    }
}
let sitemapXML = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemapXML += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const file of myfiles) {
  sitemapXML += '  <url>\n';
  sitemapXML += `    <loc>${file.url}</loc>\n`;
  sitemapXML += '  </url>\n';
  sitemapXML += '\n';
}
sitemapXML += '</urlset>\n';
fs.writeFileSync("./sitemap.xml", sitemapXML);
fs.writeFileSync("./docs/files.json", JSON.stringify(myfiles));
