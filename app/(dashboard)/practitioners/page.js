'use client'
import { Col, Row, Card, Accordion, Nav, Tab, Tabs, Container } from 'react-bootstrap';
import { HighlightCode } from 'widgets';
import {
	AccordionBasicCode,
	AccordionFlushCode
} from 'data/code/AccordionCode';
export default function Pactitioners(){

    return (
		<Container fluid className="p-6">
			<Row>
				<Col lg={12} md={12} sm={12}>
					<div className="border-bottom pb-4 mb-4 d-md-flex align-items-center justify-content-between">
						<div className="mb-3 mb-md-0">
							<h1 className="mb-1 h2 fw-bold">Practitioners</h1>
							<p className="mb-0 ">
								Build vertically collapsing accordions in combination with the
								Collapse component.
							</p>
						</div>
					</div>
				</Col>
			</Row>

            <Accordion defaultActiveKey="0">
											<Accordion.Item eventKey="0">
												<Accordion.Header>Nainji Hora</Accordion.Header>
												<Accordion.Body>
													<strong>This is the accordion body of item 1.</strong>{' '}
													It is hidden by default, until the collapse plugin
													adds the appropriate classes that we use to style each
													element. These classes control the overall appearance,
													as well as the showing and hiding via CSS transitions.
													You can modify any of this with custom CSS or
													overriding our default variables. It&apos;s also worth
													noting that just about any HTML can go within the{' '}
													<code>&lt;Accordion.Item&gt;</code> &rarr;{' '}
													<code>&lt;Accordion.Body&gt;</code> though the
													transition does limit overflow.
												</Accordion.Body>
											</Accordion.Item>
											<Accordion.Item eventKey="1">
												<Accordion.Header>Rohit Sharma</Accordion.Header>
												<Accordion.Body>
													<strong>This is the accordion body of item 2.</strong>{' '}
													It is hidden by default, until the collapse plugin
													adds the appropriate classes that we use to style each
													element. These classes control the overall appearance,
													as well as the showing and hiding via CSS transitions.
													You can modify any of this with custom CSS or
													overriding our default variables. It&apos;s also worth
													noting that just about any HTML can go within the{' '}
													<code>&lt;Accordion.Item&gt;</code> &rarr;{' '}
													<code>&lt;Accordion.Body&gt;</code> though the
													transition does limit overflow.
												</Accordion.Body>
											</Accordion.Item>
											<Accordion.Item eventKey="2">
												<Accordion.Header>Mahesh Kumawat</Accordion.Header>
												<Accordion.Body>
													<strong>This is the accordion body of item 3.</strong>{' '}
													It is hidden by default, until the collapse plugin
													adds the appropriate classes that we use to style each
													element. These classes control the overall appearance,
													as well as the showing and hiding via CSS transitions.
													You can modify any of this with custom CSS or
													overriding our default variables. It&apos;s also worth
													noting that just about any HTML can go within the{' '}
													<code>&lt;Accordion.Item&gt;</code> &rarr;{' '}
													<code>&lt;Accordion.Body&gt;</code> though the
													transition does limit overflow.
												</Accordion.Body>
											</Accordion.Item>
										</Accordion>
		</Container>
	);
}