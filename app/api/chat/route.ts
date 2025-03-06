import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, todos } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant managing a todo list. Current todos: ${JSON.stringify(todos)}. 
          
          Respond with JSON in the following formats based on the user's intent:
          
          1. For creating a new todo: 
             { "action": "create", "item": "item text", "response": "Confirmation message" }
          
          2. For reading/checking if an item exists: 
             { "action": "read", "item": "item text", "response": "Yes/No response with details" }
          
          3. For updating an existing todo: 
             { "action": "update", "oldItem": "original text", "newItem": "new text", "response": "Confirmation message" }
          
          4. For deleting a todo: 
             { "action": "delete", "item": "item text", "response": "Confirmation message" }
             
          5. For toggling completion status:
             { "action": "toggle", "item": "item text", "response": "Confirmation message" }
          
          Analyze the user's message carefully to determine their intent. If they're asking if something is on the list,
          use the "read" action. If they want to mark something as done/completed, use the "toggle" action.
          
          Always respond with valid JSON that matches one of these formats.`
        },
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" }
    });

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 