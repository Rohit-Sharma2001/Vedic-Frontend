'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import Link from 'next/link';
import { config } from 'services/config';
import { postApi } from 'services/api';

export default function AddCoupon() {
    const router = useRouter();
   const [formData, setFormData] = useState({
  title: '',
  couponCode: '',
  discountType: '',
  discountValue: 0,
  thresholdAmount: 0,
  maxDiscount: 0,
  totalUserLimit: null,
  perUserLimit: null,
  startDateTime: '',
  expiryType: '',
  expiryDate: '',
  applicableTo: 'cart',
  specificProducts: [],
  description: '',
  customerType: '',
});

// local UI state (not sent to API)
const [showTotalUserLimit, setShowTotalUserLimit] = useState(false);
const [showPerUserLimit, setShowPerUserLimit] = useState(false);
const [errorMessage, setErrorMessage] = useState('');


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleExpiryTypeChange = (e) => {
        const expiryType = e.target.value;
        setFormData({
            ...formData,
            expiryType,
            expiryDate: expiryType === 'non-expiry' ? '' : formData.expiryDate,
        });
    };

    const handleApplicableToChange = (e) => {
        setFormData({
            ...formData,
            applicableTo: e.target.value,
            specificProducts: e.target.value === 'product' ? formData.specificProducts : [],
        });
    };

   const handleSubmit = async (e) => {
  e.preventDefault();

  // validation: only when both are enabled & filled
  if (
    showTotalUserLimit &&
    showPerUserLimit &&
    formData.totalUserLimit !== null &&
    formData.perUserLimit !== null &&
    Number(formData.perUserLimit) > Number(formData.totalUserLimit)
  ) {
    setErrorMessage('Per User Limit cannot be greater than Total User Limit.');
    return;
  }

  setErrorMessage(''); // clear error if valid

  try {
    const endpoint = config.Addcoupon;
    const data = { ...formData };
    console.log(data);

    const response = await postApi(endpoint, data);

    if (response.statusCode === 201) {
      resetForm();
      router.push('/admin/coupon');
    } else {
      alert('Failed to add coupon!');
    }
  } catch (error) {
    console.error('Error submitting coupon:', error);
  }
};


    const resetForm = () => {
        setFormData({
            title: '',
            couponCode: '',
            discountType: '',
            discountValue: 0,
            thresholdAmount: 0,
            maxDiscount: 0,
            totalUserLimit: 0,
            perUserLimit: 0,
            startDateTime: '',
            expiryType: '',
            expiryDate: '',
            applicableTo: 'cart',
            specificProducts: [],
            description: '',
            customerType: '',
        });
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <Row className="mb-3">
                                <Col>
                                    <h2>Add New Coupon</h2>
                                </Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href="/admin/coupon">
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title <b style={{color:"red"}}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Coupon Code <b style={{color:"red"}}>*</b></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="couponCode"
                                                value={formData.couponCode}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Discount Type <b style={{color:"red"}}>*</b></Form.Label>
                                            <Form.Select
                                                name="discountType"
                                                value={formData.discountType}
                                                onChange={handleInputChange}
                                                required>
                                                <option value="">Select Discount Type</option>
                                                <option value="percentage">Percentage</option>
                                                <option value="fixed">Fixed Amount</option>
                                                {/* <option value="bogo">Buy 1, Get 1</option> */}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Discount Value <b style={{color:"red"}}>*</b></Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="discountValue"
                                                value={formData.discountValue}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                {formData.discountType === 'percentage' && (
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Maximum Discount</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="maxDiscount"
                                                    value={formData.maxDiscount}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Start Date and Time <b style={{color:"red"}}>*</b></Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                name="startDateTime"
                                                value={formData.startDateTime}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Expiry Type <b style={{color:"red"}}>*</b></Form.Label>
                                            <Form.Select
                                                name="expiryType"
                                                value={formData.expiryType}
                                                onChange={handleExpiryTypeChange}
                                                required>
                                                <option value="">Select Expiry Type</option>
                                                <option value="expiry">Expiry</option>
                                                <option value="non-expiry">Non-Expiry</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    {formData.expiryType === 'expiry' && (
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Expiry Date <b style={{color:"red"}}>*</b></Form.Label>
                                                <Form.Control
                                                    type="datetime-local"
                                                    name="expiryDate"
                                                    value={formData.expiryDate}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    )}
                                </Row>
                                {/* <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Applicable To <b style={{color:"red"}}>*</b></Form.Label>
                                            <Form.Select
                                                name="applicableTo"
                                                value={formData.applicableTo}
                                                onChange={handleApplicableToChange}
                                                required>
                                                <option value="cart">Entire Cart</option>
                                                <option value="product">Specific Products</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    {formData.applicableTo === 'product' && (
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Specific Products</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="specificProducts"
                                                    value={formData.specificProducts}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter product IDs separated by commas"
                                                />
                                            </Form.Group>
                                        </Col>
                                    )}
                                </Row> */}
                              <Row>
  <Col md={6}>
    <Form.Group className="mb-3">
      <Form.Check
        type="checkbox"
        label="Enable Total User Limit"
        checked={showTotalUserLimit}
        onChange={(e) => {
          setShowTotalUserLimit(e.target.checked);
          if (!e.target.checked) {
            setFormData((prev) => ({ ...prev, totalUserLimit: null }));
          }
        }}
      />
      {showTotalUserLimit && (
        <Form.Control
          type="number"
          placeholder='Enter Total User Limit'
          name="totalUserLimit"
          value={formData.totalUserLimit ?? ''}
          onChange={handleInputChange}
        />
      )}
    </Form.Group>
  </Col>

  <Col md={6}>
    <Form.Group className="mb-3">
      <Form.Check
        type="checkbox"
        label="Enable Per User Limit"
        checked={showPerUserLimit}
        onChange={(e) => {
          setShowPerUserLimit(e.target.checked);
          if (!e.target.checked) {
            setFormData((prev) => ({ ...prev, perUserLimit: null }));
          }
        }}
      />
      {showPerUserLimit && (
        <Form.Control
          type="number"
          name="perUserLimit"
          placeholder='Enter Per User Limit'
          value={formData.perUserLimit ?? ''}
          onChange={handleInputChange}
        />
      )}
    </Form.Group>
  </Col>
</Row>

                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Add a short description about the coupon"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Customer Type</Form.Label>
                                            <Form.Select
                                                name="customerType"
                                                value={formData.customerType}
                                                onChange={handleInputChange}>
                                                <option value="">Select Customer Type</option>
                                                <option value="new">First order Customers</option>
                                                {/* <option value="existing">Existing Customers</option> */}
                                                <option value="all">All Customers</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                {errorMessage && (
  <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage}</p>
)}

                                <Button type="submit" variant="primary">
                                    Add Coupon
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
