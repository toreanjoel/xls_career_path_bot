// This code is for v4 of the openai package: npmjs.com/package/openai
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// We clean the payload in order to hav it good for AI
function toAIDataStructure(data) {
	console.log("LOG: Take uploaded sheet file col/row data")
	return data.map((item) => {
		const [index, course_name, career_options] = Object.keys(item)
		return {
			"index": item[index],
			[course_name]: item[course_name],
			[career_options]: ""
		}
	})
}

// Generate responses through AI
export async function computeCourses(data) {
  try {
		console.log("LOG: Create AI context data")
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content:
            "Given a list of academic courses, complete with each course's index and name, generate a JSON response that fills in potential career options for each listed course. For each course, provide about 10 career options. The career options should start with capital letters and be separated by a comma and a space. If a course is a duplicate of an earlier course (based on its content), provide the same career options and include a \"Duplicate\" key with the value of the original course's index. If there is no duplicate, the \"Duplicate\" key should have an empty string as its value. If any of the course The JSON response should be clean and contain no explanatory or verbose text outside of the JSON structure itself.\n",
        },
				{
          role: "user",
          content:
            '[\n  {"index": 1, "Course Name": "Business Management N4-N6", "Career Options": ""},\n  {"index": 2, "Course Name": "Public Management", "Career Options": ""}\n]\n',
        },
        {
          role: "assistant",
          content:
            '[\n  {\n    "index": 1,\n    "Course Name": "Business Management N4-N6",\n    "Career Options": "Business Consultant, Operations Manager, Entrepreneur, Business Development Manager, Sales Manager, Human Resources Manager, Project Manager, Financial Analyst, Marketing Manager, Compliance Officer",\n    "Duplicate": ""\n  },\n  {\n    "index": 2,\n    "Course Name": "Public Management",\n    "Career Options": "Policy Analyst, Public Relations Specialist, City Planner, Non-Profit Organizer, Fundraising Manager, Legislative Assistant, Government Affairs Director, Public Works Director, Social Services Administrator, Community Development Planner",\n    "Duplicate": ""\n  }\n]', // Notice the empty string "" instead of null
        },
        {
          role: "user",
          content:
            '[\n  {"index": 3, "Course Name": "Financial Management", "Career Options": ""},\n  {"index": 4, "Course Name": "Financial Management", "Career Options": ""}\n]',
        },
        {
          role: "assistant",
          content:
            '[\n  {\n    "index": 3,\n    "Course Name": "Financial Management",\n    "Career Options": "Financial Analyst, Investment Banker, Tax Advisor, Internal Auditor, Financial Planner, Portfolio Manager, Risk Manager, Insurance Advisor, Treasurer, Credit Analyst",\n    "Duplicate": null\n  },\n  {\n    "index": 4,\n    "Course Name": "Financial Management",\n    "Career Options": "Financial Analyst, Investment Banker, Tax Advisor, Internal Auditor, Financial Planner, Portfolio Manager, Risk Manager, Insurance Advisor, Treasurer, Credit Analyst",\n    "Duplicate": 3\n  }\n]',
        },
        {
          role: "user",
          content: JSON.stringify(toAIDataStructure(data)), // Here we're inputting our stringified data
        },
      ],
      temperature: 0,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

		return response.choices[0]
  } catch (error) {
    console.error("API call error:", error);
    return false;
  }
}
