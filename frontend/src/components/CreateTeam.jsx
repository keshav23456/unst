import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Users } from 'lucide-react';
import participantService from '../backend/participant';
import { useNavigate, useParams } from 'react-router-dom';

function CreateTeam() {

    const navigate = useNavigate()
    const { hackathonId } = useParams()
    const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async(data) => {

    try {
        const response =  await participantService.createTeam(hackathonId,data)
        if(response && response.success){
            navigate(`/team/${hackathonId}/${response.teamId}`)
        }else{
            const message = response ? response.message : "Failed to create team. Please try again.";
            setErrorMessage(message);
        }

    } catch (error) {
        console.log("Error while creating team", error);
        
    }
    
    
  };

  return (
    <div className="mt-20 min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <div className="flex items-center justify-center mb-8">
          <Users className="h-12 w-12 text-yellow-400" />
          <h1 className="text-3xl font-bold ml-3 text-gray-800">Team Registration</h1>
        </div>

        {/* Error message display */}
        {errorMessage && (
                    <div className="p-4 mb-6 rounded-md bg-red-50 border border-red-300">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                {/* You can add an error icon here if you want */}
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    {errorMessage}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Team Name</label>
            <input
              {...register("teamName", { required: "Team name is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
              placeholder="Hackathon Warriors"
            />
            {errors.teamName && (
              <p className="mt-1 text-sm text-red-600">{errors.teamName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register("description")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
              rows={3}
              placeholder="We code for fun"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-medium text-white bg-yellow-400 hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Submit Team Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTeam;



