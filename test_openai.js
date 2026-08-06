const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: 'test' });
const func = openai.responses.create;
console.log(func.toString());
