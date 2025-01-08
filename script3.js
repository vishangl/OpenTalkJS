import fs from 'fs';
import path from 'path';
import ollama from 'ollama';

async function generateAiAnswer(selectedCategory) {
  try {
    const questionsDir = './questions';
    const answersDir = './answers';

    if (!fs.existsSync(answersDir)) {
      fs.mkdirSync(answersDir, { recursive: true });
    }

    const categoryDir = path.join(questionsDir, selectedCategory);
    if (!fs.existsSync(categoryDir)) {
      console.error(`The category "${selectedCategory}" does not exist in the Questions directory.`);
      return;
    }

    const questionFiles = fs.readdirSync(categoryDir);

    if (questionFiles.length === 0) {
      console.error(`No question files found in the "${selectedCategory}" category.`);
      return;
    }

    const randomFile = questionFiles[Math.floor(Math.random() * questionFiles.length)];
    const inputFilePath = path.join(categoryDir, randomFile);
    console.log(`Randomly selected question file: ${randomFile}`);

    const inputContent = fs.readFileSync(inputFilePath, 'utf-8');

    const response = await ollama.chat({
      model: 'llama3.2:1b',
      messages: [{ role: 'user', content: inputContent }],
    });

    const chatbotResponse = response.message.content;

    const outputCategoryDir = path.join(answersDir, selectedCategory);
    if (!fs.existsSync(outputCategoryDir)) {
      fs.mkdirSync(outputCategoryDir, { recursive: true });
    }

    const existingAnswers = fs.readdirSync(outputCategoryDir).filter(file => /^A\d+\.txt$/.test(file));
    const nextAnswerNumber = existingAnswers.length + 1;
    const answerFileName = `A${nextAnswerNumber}.txt`;
    const outputFilePath = path.join(outputCategoryDir, answerFileName);

    fs.writeFileSync(outputFilePath, chatbotResponse, 'utf-8');
    console.log(`Response for ${randomFile} has been saved as ${outputFilePath}`);
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide a category as a command-line argument (e.g., Academic, Professional, Creative).');
  process.exit(1);
}

const selectedCategory = args[0];
generateAiAnswer(selectedCategory);
