'use client';
import { useState ,useEffect } from 'react';
import { config } from 'services/config';
import { postApi } from 'services/api';
export default function MyOrders() {
  const [activeTab, setActiveTab] = useState('ordersAll');
  const [userData, setUserData] = useState({})
    const [currentPage, setCurrentPage] = useState(1);
      const [pageSize, setPageSize] = useState(10);
      const [totalPages, setTotalPages] = useState(1);
      const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
      let user=JSON.parse(localStorage.getItem("user")||JSON.stringify({}))``
      setUserData(user)
    
    
      
    }, [])
       useEffect(() => {
        fetchdata(currentPage);
        }, [currentPage]);

     const fetchdata = async (page) => {
            try {
                const endpoint = config.FindUserOrders; 
                const data = { user: userData._id, page: page, pageSize: pageSize };
                const response = await postApi(endpoint, data);
                console.log(response)
                
            } catch (error) {
                console.error('Error fetching brands list:', error);
            }
        };

   
  const tabItems = [
    { id: 'ordersAll', label: 'All Orders' },
    { id: 'shipped', label: 'Not yet Shipped' },
    { id: 'orderReturns', label: 'Return Orders' },
    { id: 'orderCancel', label: 'Cancelled Orders' },
  ];

  const handleTabChange = (tab) => setActiveTab(tab);

  return (
    <div className="cardBox">
      <h2 className="fs-6 fw-semibold mb-4">My Orders</h2>

      <ul className="nav nav-tabs ordersTabs">
        {tabItems.map((tab) => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content">
        {tabItems.map((tab) => (
          <div
            key={tab.id}
            id={tab.id}
            className={`tab-pane fade ${activeTab === tab.id ? 'show active' : ''}`}
          >
            <div className="ordetails mb-3">
              <ul className="detailsUl">
                <li>Order Id <b># 407-7449830-5659562</b></li>
                <li>Order Placed <b>17 July 2022</b></li>
                <li>Amount <b>$14.00</b></li>
                <li className="text-md-end">
                  <button type="button" className="btn btn-primary py-2 px-3">
                    View Details
                  </button>
                </li>
              </ul>
              <div className="row align-items-center orderbuy m-0">
                <div className="col-md-10 px-md-0">
                  <div className="productTable">
                    <figure className="m-0">
                      <img src="/images/landingpage/order-detail.png" alt="" />
                    </figure>
                    <div>
                      <h6>Rasa Herbs</h6>
                      <span>Amalaki Powder <a href="#">Download invoice</a></span>
                    </div>
                  </div>
                  <ul className="tackList pt-4">
                    <li className="active"><b>Order Pack</b> 17 July 2022 8:00 AM</li>
                    <li className="active"><b>Order Dispatch</b> 17 July 2022 10:00 AM</li>
                    <li><b>Out For Delivered</b> 18 July 2022 10:00 AM</li>
                    <li>Order Delivered</li>
                  </ul>
                </div>
                <div className="col-md-2 px-md-0">
                  <div className="d-flex flex-md-column gap-3 align-items-end">
                    <button type="button" className="btn btn-outline-primary fs-8">
                      {tab.id === 'orderReturns' ? 'Return' : 'Cancel Order'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary fs-8">Buy It Again</button>
                  </div>
                </div>
              </div>
              <strong className={
                tab.id === 'orderCancel' ? 'cancelled' : tab.id === 'orderReturns' ? 'delivered' : ''
              }>
                {tab.id === 'orderCancel' ? 'Order Cancelled' : tab.id === 'orderReturns' ? 'Order Delivered' : 'Out For Delivered'}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
