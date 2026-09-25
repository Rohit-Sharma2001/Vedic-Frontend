// Import node module libraries
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import {
    Row,
    Col,
    Image,
    Dropdown,
    ListGroup,
} from 'react-bootstrap';
import { useLanguage,isLoggedIn } from 'context/languageContext';
// Simple bar scrolling used for notification item scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

// Import data files
import NotificationList from 'data/Notification';

// Import hooks
import useMounted from 'hooks/useMounted';

const QuickMenu = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const parsed = JSON.parse(storedUser);
    if (parsed?._id) {   // ✅ check _id instead of token
      setIsLoggedIn(true);
      return;
    }
  }
  setIsLoggedIn(false);
}, []);

    const { cartCount } = useLanguage();
    const router = useRouter();
    const hasMounted = useMounted();
    const isDesktop = useMediaQuery({ query: '(min-width: 1224px)' });

    // Function to handle logout
  const handleLogout = () => {
      localStorage.removeItem('user'); // remove full user object
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.clear()
      setIsLoggedIn(false);
      router.push('/Log-in');
};


    const Notifications = () => {
        return (
            <SimpleBar style={{ maxHeight: '300px' }}>
                <ListGroup variant="flush">
                    {NotificationList.map((item, index) => (
                        <ListGroup.Item className={index === 0 ? 'bg-light' : ''} key={index}>
                            <Row>
                                <Col>
                                    <Link href="#" className="text-muted">
                                        <h5 className="mb-1">{item.sender}</h5>
                                        <p className="mb-0">{item.message}</p>
                                    </Link>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </SimpleBar>
        );
    };

    const QuickMenuDropdown = () => (
        <Dropdown.Menu className="dropdown-menu dropdown-menu-end" align="end">
          
            <Dropdown.Item onClick={handleLogout}>
                <i className="fe fe-power me-2"></i> Sign Out
            </Dropdown.Item>
            {/* <Dropdown.Item >
                <a href='/' className="fe fe-power me-2">Move To Website</a>
            </Dropdown.Item> */}
            <Dropdown.Item onClick={() => window.location.href = '/'}>
  <i className="fe fe-power me-2"></i> Move To Website
</Dropdown.Item>
        </Dropdown.Menu>
    );

    const QuickMenuDesktop = () => (
        <>
          <div style={{ display: "flex", position: "relative" }}>
                      <Link
                        href="/admin/orders/newOrder/adminCart"
                        className="d-flex gap-md-2 loginBtn text-orange"
                        aria-label="Cart"
                      >
                        <img
                          className="mx-md-2"
                          src="/images/landingpage/cart-header-icon.svg"
                          alt="Cart"
                          width="20"
                        />
                        <span
                          className="position-absolute rounded-circle d-flex justify-content-center align-items-center"
                          style={{
                            backgroundColor: "#662A09",
                            color: "white",
                            width: "18px",
                            height: "18px",
                            fontSize: "12px",
                            top: "0",
                            right: "0",
                            transform: "translate(50%, -50%)",
                          }}
                        >
                          {cartCount}
                        </span>
                      </Link>
                    </div>
        <ListGroup as="ul" className="navbar-right-wrap ms-auto d-flex nav-top-wrap">
            <Dropdown as="li" className="ms-2">
                <Dropdown.Toggle as="a" className="rounded-circle" id="dropdownUser">
                    <div className="avatar avatar-md avatar-indicators avatar-online">
                        <img alt="avatar" src='/images/avatar/avatar-1.jpg' className="rounded-circle" />
                    </div>
                </Dropdown.Toggle>
                <QuickMenuDropdown />
            </Dropdown>
        </ListGroup></>
    );

    const QuickMenuMobile = () => (
        <ListGroup as="ul" className="navbar-right-wrap ms-auto d-flex nav-top-wrap">
            <Dropdown as="li" className="ms-2">
                <Dropdown.Toggle as="a" className="rounded-circle" id="dropdownUser">
                    <div className="avatar avatar-md avatar-indicators avatar-online">
                        <img alt="avatar" src='/images/avatar/avatar-1.jpg' className="rounded-circle" />
                    </div>
                </Dropdown.Toggle>
                <QuickMenuDropdown />
            </Dropdown>
        </ListGroup>
    );

    return (
  <Fragment>
    {isLoggedIn ? (
      hasMounted && isDesktop ? <QuickMenuDesktop /> : <QuickMenuMobile />
    ) : (
      <Link href="/Log-in" className="d-flex align-items-center text-orange ms-3">
        <img src="/images/landingpage/login-icon2.svg" alt="Login" width="20" className="me-2" />
        Login
      </Link>
    )}
  </Fragment>
);

};

export default QuickMenu;
