'use client'
import { Fragment, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { useMediaQuery } from 'react-responsive';
import { ListGroup, Card, Image, Badge } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { DashboardMenu } from 'routes/DashboardRoutes';

const getFilteredMenu = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const allowedModules =
        user?.modules
            ?.filter((m) => m.status === 1)
            ?.map((m) => m.moduleName.trim().toLowerCase()) || [];

    return DashboardMenu
        .map((menu) => {
            if (!menu.children) {
                return allowedModules.includes(menu.title.trim().toLowerCase()) ? menu : null;
            }
            const children = menu.children.filter((child) =>
                allowedModules.includes(child.name.trim().toLowerCase())
            );
            return children.length ? { ...menu, children } : null;
        })
        .filter(Boolean);
};

const isMenuActive = (menu, currentPath) => {
    if (menu.children) {
        return menu.children.some(child => isMenuActive(child, currentPath));
    }
    if (menu.link) return currentPath === menu.link;
    return false;
};

const NavbarVertical = (props) => {
    const location = usePathname();
    const isMobile = useMediaQuery({ maxWidth: 767 });

    // ✅ Inside component so location is available
    const filteredMenu = getFilteredMenu();
    const defaultOpenKey = filteredMenu.findIndex(
        (menu) => menu.children && isMenuActive(menu, location)
    );

//   const CustomToggle = ({ children, eventKey, icon, isActive }) => {
//     const { activeEventKey } = useContext(AccordionContext);
//     const decoratedOnClick = useAccordionButton(eventKey, () => {});
//     const isCurrentEventKey = activeEventKey === eventKey;
//     return (
//         <li className="nav-item" style={{ backgroundColor: isActive ? "#6c757d" : "" }}>
//             <Link
//                 href="#"
//                 className={`nav-link ${isActive ? 'active' : ''}`}
//                 onClick={decoratedOnClick}
//                 aria-expanded={isCurrentEventKey ? true : false}
//                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
//             >
//                 <span style={{ display: 'flex', alignItems: 'center' }}>
//                     {icon ? <i className={`nav-icon fe fe-${icon} me-2`}></i> : ''}
//                     {children}
//                 </span>
//                 <span
//                     style={{
//                         display: 'inline-block',
//                         transition: 'transform 0.2s ease',
//                         transform: isCurrentEventKey ? 'rotate(90deg)' : 'rotate(0deg)',
//                         fontSize: '12px',
//                         color: isActive ? '#fff' : '#b0b0b0'
//                     }}
//                 >
//                     &#9654;
//                 </span>
//             </Link>
//         </li>
//     );
// };

const CustomToggle = ({ children, eventKey, icon, isActive }) => {
    const { activeEventKey } = useContext(AccordionContext);
    const decoratedOnClick = useAccordionButton(eventKey, () => {});
    const isCurrentEventKey = activeEventKey === eventKey;
    return (
        <li className="nav-item" style={{ backgroundColor: isActive ? "#6c757d" : "" }}>
            <Link
                href="#"
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={decoratedOnClick}
                aria-expanded={isCurrentEventKey ? true : false}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}
            >
                <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    overflow: 'hidden',   // ✅ clip overflow
                    flex: 1,              // ✅ take available space but leave room for arrow
                    minWidth: 0           // ✅ critical — allows flex child to shrink below content size
                }}>
                    {icon ? <i className={`nav-icon fe fe-${icon} me-2`} style={{ flexShrink: 0 }}></i> : ''}
                    
                    {/* ✅ ellipsis on long names */}
                    <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {children}
                    </span>
                </span>

                {/* ✅ Arrow — never shrinks */}
                <span
                    style={{
                        display: 'inline-block',
                        flexShrink: 0,         // ✅ arrow never gets squeezed
                        transition: 'transform 0.2s ease',
                        transform: isCurrentEventKey ? 'rotate(90deg)' : 'rotate(0deg)',
                        fontSize: '12px',
                        marginLeft: '6px',
                        color: isActive ? '#fff' : '#b0b0b0'
                    }}
                >
                    &#9654;
                </span>
            </Link>
        </li>
    );
};

    const CustomToggleLevel2 = ({ children, eventKey }) => {
        const { activeEventKey } = useContext(AccordionContext);
        const decoratedOnClick = useAccordionButton(eventKey, () => {});
        const isCurrentEventKey = activeEventKey === eventKey;
        return (
            <Link
                href="#"
                className="nav-link"
                onClick={decoratedOnClick}
                aria-expanded={isCurrentEventKey ? true : false}>
                {children}
            </Link>
        );
    };

    const generateLink = (item) => {
        return (
            <Link
                href={item.link}
                className={`nav-link ${location === item.link ? 'active' : ''}`}
                onClick={() => isMobile ? props.onClick(!props.showMenu) : null}>
                {item.name}
                {item.badge ? (
                    <Badge className="ms-1" bg={item.badgecolor ? item.badgecolor : 'primary'}>
                        {item.badge}
                    </Badge>
                ) : ''}
            </Link>
        );
    };

    return (
        <Fragment>
            <SimpleBar style={{ maxHeight: '100vh' }}>
                <div className="nav-scroller">
                    <Image src="/images/brand/logo.webp" width={248} height={59} />
                </div>

                {/* ✅ defaultOpenKey computed inside component using live location */}
                <Accordion
                    defaultActiveKey={defaultOpenKey !== -1 ? defaultOpenKey : undefined}
                    as="ul"
                    className="navbar-nav flex-column">

                    {/* ✅ filteredMenu is an array, not a function — no () */}
                    {filteredMenu.map(function (menu, index) {
                        if (menu.grouptitle) {
                            return (
                                <Card bsPrefix="nav-item" key={index}>
                                    <div className="navbar-heading">{menu.title}</div>
                                </Card>
                            );
                        } else {
                            if (menu.children) {
                                return (
                                    <Fragment key={index}>
                                        <CustomToggle
                                            eventKey={index}
                                            icon={menu.icon}
                                            isActive={isMenuActive(menu, location)}>
                                            {menu.title}
                                            {menu.badge ? (
                                                <Badge className="ms-1" bg={menu.badgecolor ? menu.badgecolor : 'primary'}>
                                                    {menu.badge}
                                                </Badge>
                                            ) : ''}
                                        </CustomToggle>
                                        <Accordion.Collapse eventKey={index} as="li" bsPrefix="nav-item">
                                            <ListGroup as="ul" bsPrefix="" className="nav flex-column">
                                                {menu.children.map(function (menuLevel1Item, menuLevel1Index) {
                                                    if (menuLevel1Item.children) {
                                                        return (
                                                            <ListGroup.Item as="li" bsPrefix="nav-item" key={menuLevel1Index}>
                                                                <Accordion defaultActiveKey="0" className="navbar-nav flex-column">
                                                                    <CustomToggleLevel2 eventKey={0}>
                                                                        {menuLevel1Item.title}
                                                                        {menuLevel1Item.badge ? (
                                                                            <Badge className="ms-1" bg={menuLevel1Item.badgecolor ? menuLevel1Item.badgecolor : 'primary'}>
                                                                                {menuLevel1Item.badge}
                                                                            </Badge>
                                                                        ) : ''}
                                                                    </CustomToggleLevel2>
                                                                    <Accordion.Collapse eventKey={0} bsPrefix="nav-item">
                                                                        <ListGroup as="ul" bsPrefix="" className="nav flex-column">
                                                                            {menuLevel1Item.children.map(function (menuLevel2Item, menuLevel2Index) {
                                                                                if (menuLevel2Item.children) {
                                                                                    return (
                                                                                        <ListGroup.Item as="li" bsPrefix="nav-item" key={menuLevel2Index}>
                                                                                            <Accordion defaultActiveKey="0" className="navbar-nav flex-column">
                                                                                                <CustomToggleLevel2 eventKey={0}>
                                                                                                    {menuLevel2Item.title}
                                                                                                    {menuLevel2Item.badge ? (
                                                                                                        <Badge className="ms-1" bg={menuLevel2Item.badgecolor ? menuLevel2Item.badgecolor : 'primary'}>
                                                                                                            {menuLevel2Item.badge}
                                                                                                        </Badge>
                                                                                                    ) : ''}
                                                                                                </CustomToggleLevel2>
                                                                                                <Accordion.Collapse eventKey={0} bsPrefix="nav-item">
                                                                                                    <ListGroup as="ul" bsPrefix="" className="nav flex-column">
                                                                                                        {menuLevel2Item.children.map(function (menuLevel3Item, menuLevel3Index) {
                                                                                                            return (
                                                                                                                <ListGroup.Item key={menuLevel3Index} as="li" bsPrefix="nav-item">
                                                                                                                    {generateLink(menuLevel3Item)}
                                                                                                                </ListGroup.Item>
                                                                                                            );
                                                                                                        })}
                                                                                                    </ListGroup>
                                                                                                </Accordion.Collapse>
                                                                                            </Accordion>
                                                                                        </ListGroup.Item>
                                                                                    );
                                                                                } else {
                                                                                    return (
                                                                                        <ListGroup.Item key={menuLevel2Index} as="li" bsPrefix="nav-item">
                                                                                            {generateLink(menuLevel2Item)}
                                                                                        </ListGroup.Item>
                                                                                    );
                                                                                }
                                                                            })}
                                                                        </ListGroup>
                                                                    </Accordion.Collapse>
                                                                </Accordion>
                                                            </ListGroup.Item>
                                                        );
                                                    } else {
                                                        return (
                                                            <ListGroup.Item as="li" bsPrefix="nav-item" key={menuLevel1Index}>
                                                                {generateLink(menuLevel1Item)}
                                                            </ListGroup.Item>
                                                        );
                                                    }
                                                })}
                                            </ListGroup>
                                        </Accordion.Collapse>
                                    </Fragment>
                                );
                            } else {
                                return (
                                    <Card bsPrefix="nav-item" key={index} style={{ backgroundColor: location === menu.link ? '#6c757d' : '' }}>
                                        <Link
                                            href={menu.link}
                                            className={`nav-link ${location === menu.link ? 'active' : ''} ${menu.title === 'Download' ? 'bg-primary text-white' : ''}`}>
                                            {typeof menu.icon === 'string' ? (
                                                <i className={`nav-icon fe fe-${menu.icon} me-2`}></i>
                                            ) : menu.icon}
                                            {menu.title}
                                            {menu.badge ? (
                                                <Badge className="ms-1" bg={menu.badgecolor ? menu.badgecolor : 'primary'}>
                                                    {menu.badge}
                                                </Badge>
                                            ) : ''}
                                        </Link>
                                    </Card>
                                );
                            }
                        }
                    })}
                </Accordion>
            </SimpleBar>
        </Fragment>
    );
};

export default NavbarVertical;