const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: 'test' });
const messages = [
  { role: 'user', content: 'hello' }
];
(async () => {
  try {
    await openai.responses.create({ model: 'gpt-4o', input: messages });
  } catch(e) {
    console.log(e.message);
  }
})();
