import { API } from "./apiConfig.js";

export class ParticipantService{
    async getParticipants(HackathonId){
        try {
            const response = await fetch(API(`/api/v1/hackathon/participant/allteam/${HackathonId}`),
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

    async joinTeam(id){
        try {
            const response = await fetch(API(`/api/v1/hackathon/participant/join-team/${id}`),
                {
                    method: "POST",
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

    async getTeam(id){
        
        try {
            const response = await fetch(API(`/api/v1/hackathon/participant/team-details/${id}`),
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

    async createTeam(id,data){
        try {
            const response = await fetch(API(`/api/v1/hackathon/participant/create-team/${id}`),
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
}

const participantService =  new ParticipantService();

export default participantService;
