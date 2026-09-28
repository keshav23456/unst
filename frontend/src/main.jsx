import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from 'react-redux'
import store from './store/store.js'
import Home from './components/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthLayout } from './components/index.js'
import About from './components/About.jsx'
import Event from "./components/Event.jsx"
import OrganizeEventForm from './components/Organize.jsx'
import EventPage from './components/EventPage.jsx'
import AddRound from './components/AddRound.jsx'
import TeamDashboard from './components/TeamDashboard.jsx'
import Participants from './components/Participants.jsx'
import CreateTeam from './components/CreateTeam.jsx'
import SubmissionList from './components/SubmissionList.jsx'
import Resources from './components/Resources.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import RoleRoute from './components/RoleRoute.jsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children : [
      {
        path: '/',
        element: <Home/>
      },
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}> 
           <Login/>
          </AuthLayout>
        )
      },
      {
        path: "/signup",
        element: (
          <AuthLayout authentication={false}>
          <Signup/>
          </AuthLayout>
        )
      },
      {
        path: "/organize",
        element:(
        <RoleRoute roles={["organizer","admin"]} fallback="/resources">
          <OrganizeEventForm/>
        </RoleRoute>)
      },
      {
        path: "/about",
        element: (
          <About/>
        )
      },
      {
        path: "/browse-events",
        element: (
          <Event/>
        )
      },
      {
        path:"/hackathon/:id",
        element:(
          <EventPage/>
        )
      },
      {
        path:"/:id/rounds/add",
        element:(
          <RoleRoute roles={["organizer","admin"]} fallback="/resources">
          <AddRound/>
          </RoleRoute>
        )
      },
      {
        path: "/:id/participants",
        element:(
          <RoleRoute roles={["participant"]} fallback="/resources">
            <TeamDashboard/>
          </RoleRoute>
        )
      },
      {
        path: "/team/:hackathonId/:teamId",
        element:(
          <RoleRoute roles={["participant"]} fallback="/resources">
            <Participants/>
          </RoleRoute>
        )
      },
      {
        path:"/:hackathonId/create-team",
        element:(
          <RoleRoute roles={["participant"]} fallback="/resources">
            <CreateTeam/>
          </RoleRoute>
        )
      },
      {
        path:"/submissions/:hackathonId",
        element:(
          <RoleRoute roles={["organizer","admin"]}>
            <SubmissionList/>
          </RoleRoute>
        )
      },
      {
        path: "/resources",
        element: (
          <Resources/>
        )
      },
      {
        path: "/admin",
        element: (
          <RoleRoute roles={["admin"]}>
            <AdminDashboard/>
          </RoleRoute>
        )
      }
    ]
  }

]

)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
  <RouterProvider router={router}/>
  </Provider>
)

