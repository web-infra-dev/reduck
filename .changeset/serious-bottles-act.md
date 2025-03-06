---
'@modern-js-reduck/react': patch
---

fix: use Object.prototype.hasOwnProperty(obj) instead obj.hasOwnProperty

fix: 修复了对象可能有 Object.create(null) 创建，没有对象属性的问题
