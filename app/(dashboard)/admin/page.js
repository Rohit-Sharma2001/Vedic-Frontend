'use client'
import { Fragment } from "react";
import MainBanner from "./cms-landingpage/Main-Banner/page";
import Link from 'next/link';
import { Container, Col, Row } from 'react-bootstrap';

import { StatRightTopIcon } from "widgets";


import { ActiveProjects, Teams, 
    TasksPerformance 
} from "sub-components";

import ProjectsStatsData from "data/dashboard/ProjectsStatsData";

const Home = () => {
    return (
        // <Fragment>
        //     <div className=" pt-10 pb-21" style={{backgroundColor:"grey"}}></div>
        //     <Container fluid className="mt-n22 px-6">
        //         <Row>
                    
        //             {ProjectsStatsData.map((item, index) => {
        //                 return (
        //                     <Col xl={3} lg={6} md={12} xs={12} className="mt-6" key={index}>
        //                         <StatRightTopIcon info={item} />
        //                     </Col>
        //                 )
        //             })}
        //         </Row>

                
        //         <Row className="my-6">
        //             <Col xl={4} lg={12} md={12} xs={12} className="mb-6 mb-xl-0">

        //                 {/* Tasks Performance  */}
        //                 <TasksPerformance />

        //             </Col>
        //             {/* card  */}
        //             <Col xl={8} lg={12} md={12} xs={12}>

        //                 {/* Teams  */}
        //                 <Teams />

        //             </Col>
        //         </Row>
        //     </Container>
        // </Fragment>
        <MainBanner/>
    )
}
export default Home;
