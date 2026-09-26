
'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { postApi } from 'services/api';
import { config } from 'services/config';

const formatNumber = (value) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') return value.toLocaleString();
  return value;
};

// Neutral tokens shared across every block.
const palette = {
  ink: '#1F2A24',
  slate: '#6B7570',
  line: '#E3E8E4',
  pageBg: '#F7F8F6',
};

// One color identity per business area. Each block below is built entirely
// from its own entry here, so the "separate color per section" rule lives
// in one place instead of being repeated at every call site.
const categoryColors = {
  people: { accent: '#3F6857', soft: '#E8EFE9', deep: '#2E4F41' },       // sage — Users & Practitioners
  appointments: { accent: '#C77B33', soft: '#FBEEE0', deep: '#9C5E22' }, // amber — Appointments
  orders: { accent: '#3A6EA5', soft: '#E9F0F8', deep: '#274C73' },       // sky — Orders
  yoga: { accent: '#2F8F7E', soft: '#E1F2EF', deep: '#1F6457' },         // teal — Yoga Bookings
  events: { accent: '#7B5EA1', soft: '#F1EAF7', deep: '#5A4178' },       // violet — Event Bookings
  memberships: { accent: '#B5526B', soft: '#FBE9EE', deep: '#8A3950' }, // rose — Memberships
};

const SectionLabel = ({ children }) => (
  <p
    className="mb-2"
    style={{
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: palette.slate,
    }}
  >
    {children}
  </p>
);

// A single metric tile, tinted to whichever category block it lives in.
const MetricTile = ({ label, value, color }) => (
  <div className="h-100 p-3" style={{ background: color.soft, borderRadius: 12 }}>
    <p className="mb-1" style={{ fontSize: '0.74rem', color: palette.slate, fontWeight: 600 }}>
      {label}
    </p>
    <h3 className="mb-0" style={{ color: color.deep, fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' }}>
      {value}
    </h3>
  </div>
);

// A pipeline step used inside the order summary — a count with a stage name,
// connected visually so the sequence (placed -> ... -> delivered) reads as a flow.
const StageStep = ({ label, value, isLast, tone }) => (
  <div className="d-flex align-items-center flex-grow-1">
    <div
      className="flex-grow-1 text-center py-3 px-2"
      style={{
        background: '#FFFFFF',
        border: `1.5px solid ${tone}`,
        borderRadius: 12,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: tone, lineHeight: 1.1 }}>
        {formatNumber(value)}
      </div>
      <div
        style={{
          fontSize: '0.7rem',
          color: palette.slate,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
    {!isLast && (
      <div
        aria-hidden="true"
        style={{ width: 18, height: 2, background: palette.line, flexShrink: 0, margin: '0 6px' }}
      />
    )}
  </div>
);

const OrderPipelineCard = ({ title, badge, stages, tone, softTone }) => (
  <Card className="h-100" style={{ border: `1px solid ${palette.line}`, borderRadius: 14 }}>
    <Card.Body className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="mb-0" style={{ color: palette.ink, fontWeight: 700 }}>
          {title}
        </h6>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: tone,
            background: softTone,
            borderRadius: 20,
            padding: '4px 10px',
          }}
        >
          {badge} active
        </span>
      </div>
      <div className="d-flex align-items-stretch">
        {stages.map((s, i) => (
          <StageStep key={s.label} label={s.label} value={s.value} isLast={i === stages.length - 1} tone={tone} />
        ))}
      </div>
    </Card.Body>
  </Card>
);

const EmptyState = ({ text }) => (
  <div className="text-center py-4">
    <p className="mb-0" style={{ color: palette.slate, fontSize: '0.9rem' }}>
      {text}
    </p>
  </div>
);

// A small labeled row used inside breakdown lists (yoga classes, events, membership plans).
const BreakdownRow = ({ label, value, color }) => (
  <p className="mb-1 d-flex justify-content-between" style={{ fontSize: '0.88rem' }}>
    <span style={{ color: palette.slate }}>{label}</span>
    <strong style={{ color: color.deep }}>{formatNumber(value)}</strong>
  </p>
);

// The shared shell every category uses: a colored top edge, a title row with
// an optional headline badge, a grid of metric tiles, and room for any
// section-specific detail (pipelines, breakdown lists) underneath.
const CategoryBlock = ({ title, subtitle, color, metrics, children }) => (
  <Card
    className="mb-4"
    style={{ border: `1px solid ${palette.line}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(31,42,36,0.04)' }}
  >
    <div style={{ height: 4, background: color.accent }} />
    <Card.Body className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color.accent, display: 'inline-block' }} />
          <h5 className="mb-0" style={{ color: palette.ink, fontWeight: 700 }}>
            {title}
          </h5>
        </div>
        {subtitle && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: color.deep,
              background: color.soft,
              borderRadius: 20,
              padding: '4px 12px',
            }}
          >
            {subtitle}
          </span>
        )}
      </div>

      {metrics && metrics.length > 0 && (
        <Row className="g-3">
          {metrics.map((m) => (
            <Col key={m.label} xs={12} sm={6} lg={3}>
              <MetricTile label={m.label} value={m.value} color={color} />
            </Col>
          ))}
        </Row>
      )}

      {children && <div className={metrics && metrics.length ? 'mt-4' : ''}>{children}</div>}
    </Card.Body>
  </Card>
);

export default function AdminDashboardPage() {
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await postApi(config.dashboardSummary, {});
        setDashboardSummary(response?.data || response);
      } catch (error) {
        console.error('Failed to load admin dashboard summary:', error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const pickupPickedUp = dashboardSummary?.orderStages?.pickup?.pickedUp ?? 0;
  const deliveredOrdersValue = dashboardSummary
    ? (dashboardSummary?.deliveredOrders ?? 0) + pickupPickedUp
    : undefined;

  const pickup = dashboardSummary?.orderStages?.pickup;
  const shipping = dashboardSummary?.orderStages?.shipping;

  const pickupStages = pickup
    ? [
        { label: 'Placed', value: pickup.placed },
        { label: 'Packed', value: pickup.packed },
        { label: 'Ready', value: pickup.ready },
        { label: 'Picked Up', value: pickup.pickedUp },
      ]
    : [];

  const shippingStages = shipping
    ? [
        { label: 'Placed', value: shipping.placed },
        { label: 'Dispatched', value: shipping.dispatched },
        { label: 'Delivered', value: shipping.delivered },
      ]
    : [];

  const pickupActive = pickup ? (pickup.placed || 0) - (pickup.pickedUp || 0) : 0;
  const shippingActive = shipping ? (shipping.placed || 0) - (shipping.delivered || 0) : 0;

  // Two related fulfillment flows, kept inside the Orders block but shaded
  // a touch differently so "in-store pickup" and "ship to address" still
  // read apart from one another at a glance.
  const pickupTone = '#2D5F86';
  const pickupSoft = '#E4ECF4';
  const shippingTone = categoryColors.orders.accent;
  const shippingSoft = categoryColors.orders.soft;

  const membershipPlanRows = dashboardSummary?.membershipPlanCounts
    ? (Array.isArray(dashboardSummary.membershipPlanCounts)
        ? dashboardSummary.membershipPlanCounts.map((item) => ({
            key: item._id || item.membershipId || item.planName,
            name: item.planName || item.name || 'Unknown Plan',
            count: item.count ?? item.total ?? 0,
          }))
        : Object.entries(dashboardSummary.membershipPlanCounts).map(([plan, count]) => ({
            key: plan,
            name: plan,
            count,
          })))
    : [];

  const quickLinks = [
    // { title: 'Practitioner Calendar', subtitle: 'View upcoming practitioner slots', href: '/admin/Practitioner-Dashboard' },
    { title: 'All Users', subtitle: 'Manage users and practitioners', href: '/admin/users' },
    { title: 'Orders', subtitle: 'Review recent Orders', href: '/admin/orders' },
    { title: 'Events', subtitle: 'Open event management', href: '/admin/Event-Management/Events' },
    { title: 'Yoga Classes', subtitle: 'Open yoga management', href: '/admin/Yoga-Class-Management/Yoga-Classes' },

  ];

  return (
    <Container
      fluid
      className="mt-4 mb-5 admin-dashboard-page"
      style={{ maxWidth: 1320, fontFamily: "'Poppins', sans-serif" }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .admin-dashboard-page {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      {/* Header */}
      <Row>
        <Col>
          <Card
            className="mb-4"
            style={{
              border: 'none',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${categoryColors.people.accent} 0%, ${categoryColors.people.deep} 100%)`,
              boxShadow: '0 4px 14px rgba(63,104,87,0.18)',
            }}
          >
            <Card.Body className="py-4 px-4">
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                <div>
                  <h1 className="h3 mb-2 text-white">Admin Dashboard</h1>
                  <p className="mb-0" style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.95rem' }}>
                    Live view of appointments, orders, event, yoga class and membership activity.
                  </p>
                </div>
                <div>
                  {loading ? (
                    <Button variant="light" disabled className="fw-semibold">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading summary
                    </Button>
                  ) : (
                    <>
                      <Link href="/admin/orders/newOrder" className="btn btn-light fw-semibold me-2">
                        Place new Order
                      </Link>
                      <Link href="/admin/Practitioner-Dashboard" className="btn btn-light fw-semibold">
                        Open Practitioner Calendar
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loadError && (
        <Row>
          <Col>
            <Card
              className="mb-4"
              style={{ border: `1px solid ${categoryColors.appointments.accent}`, borderRadius: 12, background: categoryColors.appointments.soft }}
            >
              <Card.Body className="py-3 px-4">
                <p className="mb-0" style={{ color: categoryColors.appointments.deep, fontWeight: 600, fontSize: '0.9rem' }}>
                  Could not load the latest summary. Showing zero values below — try refreshing the page.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Users & Practitioners */}
      <CategoryBlock
        title="Users & Practitioners"
        subtitle={`${formatNumber(dashboardSummary?.totalUsers)} total users`}
        color={categoryColors.people}
        metrics={[
          { label: 'Total Users', value: formatNumber(dashboardSummary?.totalUsers) },
          { label: 'Active Users', value: formatNumber(dashboardSummary?.activeUsers) },
          { label: 'Inactive Users', value: formatNumber(dashboardSummary?.inactiveUsers) },
          { label: 'Vedic Yours Team Members', value: formatNumber(dashboardSummary?.activeAdmin) },
          { label: 'Total Practitioners', value: formatNumber(dashboardSummary?.totalPractitioners) },
          { label: 'Today Available Practitioners', value: formatNumber(dashboardSummary?.todayAvailablePractitioners) },
        //   { label: 'Active Members', value: formatNumber(dashboardSummary?.activeMembers) },
        ]}
      />

     {/* Appointments */}
<CategoryBlock
  title="Appointments"
  subtitle={`${formatNumber(dashboardSummary?.todayAppointments)} today`}
  color={categoryColors.appointments}
  metrics={[
    { label: 'Total Appointments', value: formatNumber(dashboardSummary?.totalAppointments) },
    { label: "Today's Appointments", value: formatNumber(dashboardSummary?.todayAppointments) },
    { label: 'Upcoming Appointments', value: formatNumber(dashboardSummary?.upcomingAppointments) },
    { label: 'Rescheduled Appointments', value: formatNumber(dashboardSummary?.rescheduledAppointments) },
    { label: 'Cancelled Appointments', value: formatNumber(dashboardSummary?.cancelledAppointments) },
  ]}
/>

{/* Appointment Waitlist */}
<CategoryBlock
  title="Waitlist Appointments"
  subtitle={`${formatNumber(dashboardSummary?.todayAppointmentWaitlist)} today`}
  color={categoryColors.appointments}
  metrics={[
    { label: 'Appointment Waitlist', value: formatNumber(dashboardSummary?.appointmentWaitlist) },
    { label: "Today's Waitlist Appointments", value: formatNumber(dashboardSummary?.todayAppointmentWaitlist) },
  ]}
/>


      {/* Orders */}
      <CategoryBlock
        title="Orders"
        subtitle={`${formatNumber(dashboardSummary?.totalOrders)} total`}
        color={categoryColors.orders}
        metrics={[
          { label: 'Total Orders', value: formatNumber(dashboardSummary?.totalOrders) },
          { label: 'Not Yet Shipped Orders', value: formatNumber(dashboardSummary?.notYetShippedOrders) },
          { label: 'Delivered Orders', value: formatNumber(deliveredOrdersValue) },
          { label: 'Cancelled Orders', value: formatNumber(dashboardSummary?.cancelledOrders) },
        ]}
      >
        <Row className="g-3">
          <Col xs={12} xl={6}>
            {pickup ? (
              <OrderPipelineCard
                title="Instore Pickup orders"
                badge={formatNumber(pickupActive)}
                stages={pickupStages}
                tone={pickupTone}
                softTone={pickupSoft}
              />
            ) : (
              <Card style={{ border: `1px solid ${palette.line}`, borderRadius: 14 }}>
                <Card.Body className="p-4">
                  <h6 className="mb-2" style={{ color: palette.ink, fontWeight: 700 }}>
                    Instore Pickup Orders
                  </h6>
                  <EmptyState text="No pickup order data available yet." />
                </Card.Body>
              </Card>
            )}
          </Col>
          <Col xs={12} xl={6}>
            {shipping ? (
              <OrderPipelineCard
                title="Ship to Address Orders"
                badge={formatNumber(shippingActive)}
                stages={shippingStages}
                tone={shippingTone}
                softTone={shippingSoft}
              />
            ) : (
              <Card style={{ border: `1px solid ${palette.line}`, borderRadius: 14 }}>
                <Card.Body className="p-4">
                  <h6 className="mb-2" style={{ color: palette.ink, fontWeight: 700 }}>
                    Shipping orders
                  </h6>
                  <EmptyState text="No shipping order data available yet." />
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </CategoryBlock>

      {/* Yoga Bookings */}
      <CategoryBlock
        title="Yoga Bookings"
        subtitle={`${formatNumber(dashboardSummary?.todayYogaBookings)} today`}
        color={categoryColors.yoga}
        metrics={[
          { label: 'Total Yoga Bookings', value: formatNumber(dashboardSummary?.totalYogaBookings) },
          { label: 'Today Yoga Bookings', value: formatNumber(dashboardSummary?.todayYogaBookings) },
          { label: 'Upcoming Yoga Bookings', value: formatNumber(dashboardSummary?.upcomingYogaBookings) },
          { label: 'Completed Yoga Schduleds', value: formatNumber (dashboardSummary?.yogaClassCounts.completedClasses)},
        ]}
      >
        <div className="p-3" style={{ background: categoryColors.yoga.soft, borderRadius: 12 }}>
          <p
            className="mb-2"
            style={{ fontSize: '0.72rem', fontWeight: 700, color: categoryColors.yoga.deep, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            Yoga classes
          </p>
          {dashboardSummary?.yogaClassCounts ? (
            <>
              <BreakdownRow label="Total" value={dashboardSummary.yogaClassCounts.totalClasses} color={categoryColors.yoga} />
              <BreakdownRow label="Upcoming" value={dashboardSummary.yogaClassCounts.upcomingClasses} color={categoryColors.yoga} />
              <BreakdownRow label="Completed" value={dashboardSummary.yogaClassCounts.completedClasses} color={categoryColors.yoga} />
            </>
          ) : (
            <EmptyState text="No yoga class data available." />
          )}
        </div>
      </CategoryBlock>

      {/* Event Bookings */}
      <CategoryBlock
        title="Event Bookings"
        subtitle={`${formatNumber(dashboardSummary?.todayEventBookings)} today`}
        color={categoryColors.events}
        metrics={[
          { label: 'Total Event Bookings', value: formatNumber(dashboardSummary?.totalEventBookings) },
          { label: 'Today Event Bookings', value: formatNumber(dashboardSummary?.todayEventBookings) },
        ]}
      >
        <div className="p-3" style={{ background: categoryColors.events.soft, borderRadius: 12 }}>
          <p
            className="mb-2"
            style={{ fontSize: '0.72rem', fontWeight: 700, color: categoryColors.events.deep, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            Events
          </p>
          {dashboardSummary?.eventCounts ? (
            <>
              <BreakdownRow label="Total" value={dashboardSummary.eventCounts.totalEvents} color={categoryColors.events} />
              <BreakdownRow label="Upcoming" value={dashboardSummary.eventCounts.upcomingEvents} color={categoryColors.events} />
              <BreakdownRow label="Completed" value={dashboardSummary.eventCounts.completedEvents} color={categoryColors.events} />
            </>
          ) : (
            <EmptyState text="No event data available." />
          )}
        </div>
      </CategoryBlock>

      {/* Memberships */}
      <CategoryBlock
        title="Memberships"
        subtitle={` Total Memberships : ${formatNumber(dashboardSummary?.totalMemberships)}`}
        color={categoryColors.memberships}
        metrics={[
          { label: 'Total Memberships Purchased', value: formatNumber(dashboardSummary?.totalMembershipsPurchased) }, 
          { label: 'Active Memberships', value: formatNumber(dashboardSummary?.activeMembershipsPurchased) },
          { label: 'Inactive Memberships', value: formatNumber(dashboardSummary?.inactiveMembershipsPurchased) },
          { label: 'Cancelled Memberships', value: formatNumber(dashboardSummary?.cancelledMemberships) },
        ]}
      >
        <div className="p-3" style={{ background: categoryColors.memberships.soft, borderRadius: 12 }}>
          <p
            className="mb-2"
            style={{ fontSize: '0.72rem', fontWeight: 700, color: categoryColors.memberships.deep, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            Membership plans
          </p>
          {membershipPlanRows.length > 0 ? (
            <div className="d-flex flex-column gap-2">
              {membershipPlanRows.map((row) => (
                <div
                  key={row.key}
                  className="d-flex justify-content-between align-items-center py-2 px-3"
                  style={{ background: '#FFFFFF', borderRadius: 10 }}
                >
                  <span style={{ color: palette.ink, fontSize: '0.9rem' }}>{row.name}</span>
                  <strong style={{ color: categoryColors.memberships.deep }}>{formatNumber(row.count)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No membership plan data available." />
          )}
        </div>
      </CategoryBlock>

      {/* Quick links */}
      <SectionLabel>Quick links</SectionLabel>
      <Row className="g-3">
        {quickLinks.map((link) => (
          <Col key={link.title} xs={12} md={6} xl={3}>
            <Card className="h-100" style={{ border: `1px solid ${palette.line}`, borderRadius: '14px' }}>
              <Card.Body className="d-flex flex-column justify-content-between p-4">
                <div>
                  <h6 className="mb-2" style={{ color: palette.ink, fontWeight: 700 }}>
                    {link.title}
                  </h6>
                  <p className="mb-0" style={{ color: palette.slate, fontSize: '0.85rem' }}>
                    {link.subtitle}
                  </p>
                </div>
                <Link
                  href={link.href}
                  className="btn btn-sm mt-3 fw-semibold"
                  style={{ background: categoryColors.people.soft, color: categoryColors.people.deep, border: 'none' }}
                >
                  Go to {link.title} →
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}