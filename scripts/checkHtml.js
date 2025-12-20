const fs = require('fs');
const path = require('path');
const file = path.resolve(process.argv[2]);
const s = fs.readFileSync(file,'utf8');
let s2 = s.replace(/<!--([\s\S]*?)-->/g,'');
s2 = s2.replace(/{{[\s\S]*?}}/g,'');
const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const re = /<\/?([a-zA-Z0-9-]+)([^>]*)>/g;
let stack = [];
let m;
let lastIndex = 0;
while(m = re.exec(s2)){
  const full = m[0];
  const tag = m[1].toLowerCase();
  const attrs = m[2];
  const closing = full.startsWith('</');
  const lines = s2.slice(0,m.index).split('\n').length;
  if(closing){
    if(stack.length === 0){
      console.log(`Unmatched closing ${tag} at line ${lines}`);
      process.exit(1);
    }
    const top = stack[stack.length-1];
    if(top.tag === tag){
      stack.pop();
    } else {
      console.log(`MISMATCH at line ${lines}: closing ${tag} but top is ${top.tag} opened at line ${top.line}`);
      process.exit(1);
    }
  } else {
    if(attrs.trim().endsWith('/') || voids.has(tag)) continue;
    stack.push({tag,line:lines});
  }
}
if(stack.length){
  console.log('Unclosed tags at end:');
  stack.slice(-10).forEach(x=>console.log(x.tag,'opened at line',x.line));
  process.exit(1);
}
console.log('All tags balanced in',file);