'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { updateApiWithFile, postApi } from 'services/api';
import { config } from 'services/config';

// Dynamically import ReactQuill to support SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function CourseManagement() {
 
 


    return (
        <Container fluid>
        <h1>Course managemnt</h1>
        </Container>
    );
}
