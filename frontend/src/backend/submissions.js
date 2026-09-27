import { API } from "./apiConfig.js";

export class SubmissionService{
    async createSubmission(hackathonId,teamId,data){
        try {
            const response = await fetch(API(`/api/v1/hackathon/submissions/create-submission/${hackathonId}/${teamId}`),
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            );
            const fetchedData = await response.json()

            return fetchedData;
        } catch (error) {
            console.log(error.message);
            
        }
    }

    async getSubmission(hackathonId){
        try {
            const response = await fetch(API(`/api/v1/hackathon/submissions/fetch-submissions/${hackathonId}`),
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                    }
                }
            );
            const data = await response.json()
            
            return data;
        } catch (error) {
            console.log(error.message);
            
        }
    }

    async deleteSubmission(hackathonId){
        try {
            // was /delete-submission/ (singular) — backend route is plural
            const response = await fetch(API(`/api/v1/hackathon/submissions/delete-submissions/${hackathonId}`),
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                    }
                }
            );
            const fetchedData = await response.json()
            
            return fetchedData;
        } catch (error) {
            console.log(error.message);
            
        }
    }
}

export const submissionService = new SubmissionService()

export default submissionService;
