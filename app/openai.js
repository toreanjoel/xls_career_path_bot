import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function toAIDataStructure(data) {
  console.log("LOG: Take uploaded sheet file col/row data")
  return data.map((item) => {
    const [index, course_name, career_options] = Object.keys(item)
    const result = {
      "index": item[index] ?? "",
      "Course Name": item[course_name] ?? "",
      "Career Options": item[career_options] ?? ""
    }
		return result;
  })
}

export async function computeCourses(data) {
	//TODO: Sanatize the data
	//TODO: Check the tokens of the data and break out or change models to use
  try {
    console.log("LOG: Create AI context data")
    const structuredData = toAIDataStructure(data);

    const messages = [
      {
        role: "system",
        content: "Given a list of academic courses / Job Career titles, complete with each index and name, generate a JSON response that fills in potential career options or alternative options for each listed course/job. For each course/job, provide about 20 career options. The career options should start with capital letters and be separated by a comma and a space. If a course/job is a duplicate of an earlier course/job (based on its content), provide the same career options and include a \"Duplicate\" key with the value of the original course's index. If there is no duplicate, the \"Duplicate\" key should have an empty string as its value. If any of the course The JSON response should be clean and contain no explanatory or verbose text outside of the JSON structure itself.\n",
      },
      {
        role: "user",
        content: JSON.stringify(structuredData),
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log("LOG: Data that was sent to parse in AI")
    return response.choices[0]
  } catch (error) {
    console.error("API call error:", error);
    return false;
  }
}
