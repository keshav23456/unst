import React, { useEffect, useState } from 'react';
import { ExternalLink, Github, Clock } from 'lucide-react';
import submissionService from '../backend/submissions';
import { useParams } from 'react-router-dom';

function SubmissionList() {
  const{hackathonId} = useParams()
  const[documents,setDocuments] = useState([])
  console.log(documents);
  
  
  useEffect(()=>{
    const fetchData = async(req,res)=>{
      try {
        const data = await submissionService.getSubmission(hackathonId)
        setDocuments(data.Submissions)
      } catch (error) {
        console.log("Error while fetching submission",error.message);
      }
    }
    fetchData()
  },[])


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Document Submissions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents?documents.map((document) => (
            <div key={document._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-gray-500">ID: {document._id}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  {formatDate(document.submittedAt)}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Hackathon ID</div>
                  <div className="text-gray-700">{document.hackathoId}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Team ID</div>
                  <div className="text-gray-700">{document.teamId}</div>
                </div>

                <div className="flex gap-4 pt-4">
                  <a
                    href={document.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>View Submission</span>
                  </a>

                  <a
                    href={document.gitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Github size={16} />
                    <span>View Repository</span>
                  </a>
                </div>
              </div>
            </div>
          )):<div>No Submissions are Found For this hackathon</div>}
        </div>
      </div>
    </div>
  );
}

export default SubmissionList;