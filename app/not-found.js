'use client'
// import node module libraries
import { Col, Row, Image, Container } from 'react-bootstrap';
import Link from 'next/link';

// import hooks
import useMounted from 'hooks/useMounted';
import { Fragment } from 'react';

const NotFound = () => {
  const hasMounted = useMounted();
  return (
    <Fragment>
      {hasMounted &&
        <Container>
          <Row >
            <Col sm={12}>
              <div className="text-center">
                <div className="mb-3" >
                  <img src="/images/error/construction.jpg" style={{width:"50%" }}  alt="" className="img-fluid" />
                </div>
              
                <Link href="/" className="btn btn-primary">
                  Go To Home
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      }
    </Fragment>
  );
};


export default NotFound;


