import {
	Briefcase,
    ListTask,
    People,
    Bullseye
} from 'react-bootstrap-icons';

export const ProjectsStats = [
    {
       id:1,
       title : "Users",
       value : 18,
       icon: <Briefcase size={18}/>,
       statInfo: '<span className="text-dark me-2">2</span> Completed' 
    },
    {
        id:2,
        title : "Products",
        value : 132,
        icon: <ListTask size={18}/>,
        statInfo: '<span className="text-dark me-2">28</span> Completed' 
     },
     {
        id:3,
        title : "Practitioners",
        value : 12,
        icon: <People size={18}/>,
        statInfo: '<span className="text-dark me-2">1</span> Completed' 
     },
     
];
export default ProjectsStats;
