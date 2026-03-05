// 使用 require 导入 JSON 文件以避免 TypeScript 的 JSON 模块解析问题
const defaultTemplate = require('./default.json');
const minimalTemplate = require('./minimal.json');
const elegantTemplate = require('./elegant.json');
const cyberTemplate = require('./cyber.json');
const warmTemplate = require('./warm.json');
const forestTemplate = require('./forest.json');
const oceanTemplate = require('./ocean.json');
const sakuraTemplate = require('./sakura.json');
const starryTemplate = require('./starry.json');
const metalTemplate = require('./metal.json');
const yuelingTemplate = require('./yueling.json');

export const templates = {
    default: defaultTemplate,
    minimal: minimalTemplate,
    elegant: elegantTemplate,
    cyber: cyberTemplate,
    warm: warmTemplate,
    forest: forestTemplate,
    ocean: oceanTemplate,
    sakura: sakuraTemplate,
    starry: starryTemplate,
    metal: metalTemplate,
    yueling: yuelingTemplate
};