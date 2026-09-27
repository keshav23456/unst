import React from 'react';
import { ArrowUpRight, Eye, Users, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {ShineBorder} from "./magicui/shine-border.jsx"
import organizeService from '../backend/organize.js';
import { useNavigate } from 'react-router-dom';

const Event = () => {
  const navigate = useNavigate();
  const [events, setEvents] = React.useState([]);

  
  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
          const data = await organizeService.getAllHackathons();
          setEvents(data);
      } catch (error) {
          console.error("Error fetching hackathons:", error);
      }
    }
    fetchEvents()
  },[]);

  
  

  const CompetitionCard = ({ competition }) => (
    <div onClick={()=>navigate(`/hackathon/${competition._id}`)} className="relative overflow-hidden rounded-2xl shadow-lg transition-transform transform hover:scale-105">
      <ShineBorder borderWidth={2} duration={6} shineColor="#FFD700"/>
      {/* Banner Image */}
      <div className="relative h-48 w-full">
        <img 
          src={competition.banner} 
          alt={competition.name}
          className="w-full h-full object-cover rounded-t-2xl"
        />
        <div className={`absolute inset-0 opacity-60`}></div>
        

        {/* Arrow Link */}
        <Link 
          href="/event-page"
          className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:bg-gray-200 transition-colors"
        >
          <ArrowUpRight className="w-5 h-5 text-gray-800" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{competition.name}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-gray-200 text-sm px-3 py-1 rounded-full font-medium">💰 Prize: {competition.prizePool}</span>
          <span className="bg-gray-200 text-sm px-3 py-1 rounded-full font-medium">📅 Finale: {competition.finaleDate}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 mt-6 sm:px-6 lg:px-8">
    <div className="min-h-screen bg-gray-50 py-12 mt-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900">🚀 Exciting Competitions</h2>
          <p className="text-gray-600 mt-1">Explore the Competitions that are creating a buzz among your peers!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {events.map(competition => <CompetitionCard key={competition._id} competition={competition} />)}
          </div>
        </div>
      </div>
    </div></div>
  );
};

export default Event;
