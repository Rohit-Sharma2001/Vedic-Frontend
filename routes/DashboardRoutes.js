import { v4 as uuid } from 'uuid';



export const DashboardMenu = [
	// {
	// 	id: uuid(),
	// 	title: 'Dashboard',
	// 	icon: 'home',
	// 	link: '/admin'
	// },

	{
		id: uuid(),
		title: 'Dashboard',
		icon: 'home',
		link: '/admin/admin-dashboard'
	},
	{
		id: uuid(),
		title: 'Practitioner Calendar',
		icon: 'shopping-bag',
		link: '/admin/Practitioner-Dashboard'
	},
		{
		id: uuid(),
		title: 'User Management',
		icon: 'users',
		children: [
			{ id: uuid(), link: '/admin/users', name: 'All Users' },
			{ id: uuid(), link: '/admin/users/Practioners', name: 'Practitioners' },
			{ id: uuid(), link: '/admin/users/Practioners/add-practioners', name: 'Add Practitioners' },
			// { id: uuid(), link: '/admin/users/Practioners/practioner-calender', name: 'Practioner Calender' },
			
		]
	},
	{
		id: uuid(),
		title: 'Order Management',
		icon: 'order',
		children: [
			{ id: uuid(), link: '/admin/orders', name: 'All Orders' },
			{ id: uuid(), link: '/admin/orders/ReturnOrders', name: 'Return Orders' },
			{ id: uuid(), link: '/admin/orders/newOrder', name: 'New Order' },
			
		]
	},
	{
		id: uuid(),
		title: 'Inventory ',
		icon: 'layers',
		link:'admin/inventory',
		children: [
			{ id: uuid(), link: '/admin/inventory', name: 'Products' },
			{ id: uuid(), link: '/admin/inventory/add-product', name: 'Add New Product' },
			{ id: uuid(), link: '/admin/inventory/product-reviews', name: 'Product Reviews' },
						
		]
	},
		{
		id: uuid(),
		title: 'Shop Module Master',
		icon: 'shopping-bag',
		children: [
			{ id: uuid(), link: '/admin/Master/category', name: 'Category' },
			{ id: uuid(), link: '/admin/Master/sub-category', name: 'Sub-Category' },
			{ id: uuid(), link: '/admin/Master/Brands', name: 'Brands' },
			// { id: uuid(), link: '/admin/Master/Ingredients', name: 'Ingredients' },
			{ id: uuid(), link: '/admin/Master/ProductTypes', name: 'Product Types' },
			{ id: uuid(), link: '/admin/Master/ReturnReasons', name: 'Return Days' },
			{ id: uuid(), link: '/admin/shop-landing', name: 'Shop Page Banner' },
			
			
						
		]
	},
	{
		id: uuid(),
		title: 'Coupon management ',
		icon: 'layers',
		link:'admin/coupon',
		children: [
			{ id: uuid(), link: '/admin/coupon', name: 'Coupon' },
			{ id: uuid(), link: '/admin/coupon/add-coupon', name: 'Add New Coupon' },
		]
	},
{
		id: uuid(),
		title: 'Membership Management',
		icon: 'map-pin',
		link:'/admin/Event-Management/Events',
		children: [
			{ id: uuid(), link: '/admin/Membership-Management/banner', name: 'Banner Details' },
			{ id: uuid(), link: '/admin/Membership-Management', name: 'Plans' },
			{ id: uuid(), link: '/admin/Membership-Management/Transactions',       name: 'Transaction History'},
			// { id: uuid(), link: '/admin/Event-Management/Events/add-events', name: 'Add Events' },
			// { id: uuid(), link: '/admin/Event-Management/Event-Bookings', name: 'Transaction History' },
			
						
		]
	},
{
		id: uuid(),
		title: 'Event Management',
		icon: 'map-pin',
		link:'/admin/Event-Management/Events',
		children: [
			{ id: uuid(), link: '/admin/Event-Management/Event-Banner', name: 'Event Banner ' },
			{ id: uuid(), link: '/admin/Event-Management/Events',       name: 'Events'},
			{ id: uuid(), link: '/admin/Event-Management/Events/add-events', name: 'Add Events' },
			{ id: uuid(), link: '/admin/Event-Management/Event-Bookings', name: 'Transaction History' },
		]
	},	
	{
		id: uuid(),
		title: 'Yoga Class Management',
		icon: 'map-pin',
		link:'/admin/Yoga-Class-Management/Yoga-Classes',
		children: [
			{ id: uuid(), link: '/admin/Yoga-Class-Management/Yoga-Class-Banner', name: 'Yoga Class Banner ' },
			{ id: uuid(), link: '/admin/Yoga-Class-Management/Yoga-Classes',       name: 'Yoga Classes'},
			{ id: uuid(), link: '/admin/Yoga-Class-Management/Yoga-Classes/add-yoga-class', name: 'Add Yoga Classes' },
			{ id: uuid(), link: '/admin/Yoga-Class-Management/Yoga-Class-Bookings', name: 'Transaction History' },
		]
	},	
	{
		id: uuid(),
		title: 'Yoga Video Management',
		icon: 'map-pin',
		link:'/admin/yoga_video/Yoga',
		children: [
			{ id: uuid(), link: '/admin/yoga_video/Yoga-Banner', name: 'Yoga Video Banner ' },
			{ id: uuid(), link: '/admin/yoga_video/Yoga',       name: 'Yoga Playlist'},
			{ id: uuid(), link: '/admin/yoga_video/Yoga/add_level', name: 'Yoga Levels' },
			// { id: uuid(), link: '/admin/Event-Management/Event-Bookings', name: 'Transaction History' },
			
						
		]
	},
{
		id: uuid(),
		title: 'Courses Management',
		icon: 'map-pin',
		link:'/admin/Courses-Management/Events',
		children: [
			{ id: uuid(), link: '/admin/Courses-Management/banner', name: 'Page Details' },
			{ id: uuid(), link: '/admin/Courses-Management/Courses', name: 'Courses'},
			{ id: uuid(), link: '/admin/Courses-Management/Courses/add-courses', name: 'Add Courses'},
			{ id: uuid(), link: '/admin/Courses-Management/Categories', name: 'Course Categories' },
			{ id: uuid(), link: '/admin/Courses-Management/Transactions', name: 'Transaction History' },
			// { id: uuid(), link: '/admin/Event-Management/Event-Bookings', name: 'Transaction History' },
			
						
		]
	},
	{
		id: uuid(),
		title: 'Email Subscribers',
		icon: 'mail',
		link: '/admin/email-subscribers'
	},

	{
		id: uuid(),
		title: 'Role Management',
		icon: 'users',
		// link: '/admin/RoleManagement'
		children: [
			{ id: uuid(), link: '/admin/role', name: 'Role and Module' },
			{ id: uuid(), link: '/admin/role/user', name: 'All Admin Users' }
		]
	},
	{
		id: uuid(),
		title: 'Landing-CMS',
		icon: 'layout',
		children: [
			{ id: uuid(), link: '/admin/cms-landingpage/Main-Banner', name: 'Main-Banner' },
			{ id: uuid(), link: '/admin/cms-landingpage/Second-Banner', name: 'Feature Section' },
			{ id: uuid(), link: '/admin/cms-landingpage/Begin-Your-Journey', name: 'Begin Your Journey' },
			{ id: uuid(), link: '/admin/cms-landingpage/Ayurvedic-Services', name: 'Ayurvedic Services' },
			{ id: uuid(), link: '/admin/Event-Management/Events', name: 'Upcoming Events' },
			{ id: uuid(), link: '/admin/cms-landingpage/Ayurvedic-Product', name: 'Ayurvedic Product' },
			{ id: uuid(), link: '/admin/cms-landingpage/Labs-Section', name: 'Labs-Section' },
			{ id: uuid(), link: '/admin/cms-landingpage/Yoga-Classes', name: 'Yoga Classes Content' },
			{ id: uuid(), link: '/admin/cms-landingpage/Meet-Amita', name: 'Meet-Amita' },
			// { id: uuid(), link: '/admin/cms-landingpage/Blog-Management', name: 'Blog-Management' },
			{ id: uuid(), link: '/admin/cms-landingpage/Resources', name: 'Resources' },
			{ id: uuid(), link: '/admin/cms-landingpage/healing-believing', name: 'Healing Is Believing' },
						
		]
	},
{
		id: uuid(),
		title: 'CMS Pages ',
		icon: 'layout',
		children: [
			
			{ id: uuid(), link: '/admin/cms-content/ContactAmitaJainPage', name: 'Contact Amita Jain Page' },
			{ id: uuid(), link: '/admin/cms-content/TreatingDoshaImbalancePageAdmin', name: 'Dosha Imbalance Page' },
			{ id: uuid(), link: '/admin/cms-content/FreeClinicPageAdmin', name: 'Free Clinic Page' },
			{ id: uuid(), link: '/admin/cms-content/JobOpeningPageAdmin', name: 'Jobs Page' },
			{ id: uuid(), link: '/admin/cms-content/KaphaBalancingDietPageAdmin', name: 'Kapha Diet Page' },
			{ id: uuid(), link: '/admin/cms-content/KaphaLifeStylePageAdmin', name: 'Kapha Life-Style Page' },
			{ id: uuid(), link: '/admin/cms-content/MeetFamilyPageAdmin', name: 'Our Team Page' },
			{ id: uuid(), link: '/admin/cms-content/PittaBalancingDietPageAdmin', name: 'Pitta Diet Page' },
			{ id: uuid(), link: '/admin/cms-content/PittaLifeStylePageAdmin', name: 'Pitta Life-Style Page' },
			{ id: uuid(), link: '/admin/cms-content/QuizPageAdmin', name: 'Dosha Quiz Page' },
			{ id: uuid(), link: '/admin/cms-content/TalksByAmitaPageAdmin', name: 'Talks Page' },
			// { id: uuid(), link: '/admin/cms-content/ArticlesByAmitaPageAdmin', name: 'Articles By Amita Page' },
			{ id: uuid(), link: '/admin/cms-content/YogaClassesPageAdmin', name: 'Testimonials Page' },
			{ id: uuid(), link: '/admin/cms-content/YourDoshasPageAdmin', name: 'Your Doshas Page' },
			{ id: uuid(), link: '/admin/cms-content/BooksArticlesPageAdmin', name: 'Books & Articles Page' },
			{ id: uuid(), link: '/admin/cms-content/CaseStoriesPageAdmin', name: 'Case Studies Page' },
			{ id: uuid(), link: '/admin/cms-content/DonateHealingPageAdmin', name: 'Donate Page' },
			{ id: uuid(), link: '/admin/cms-content/VataLifeStylePageAdmin', name: 'Vata Diet Page' },
			{ id: uuid(), link: '/admin/cms-content/VataBalancingDietPageAdmin', name: 'Vata Life-Style Page' }, 
			{ id: uuid(), link: '/admin/cms-content/AyurvedicHealingPageAdmin', name: 'What Ayurveda Page' },
			{ id: uuid(), link: '/admin/cms-content/AmitaHomePageAdmin', name: 'Amita Jain Home Page' },
			{ id: uuid(), link: '/admin/cms-content/SchedulePage', name: 'Schedule Page' },
			{ id: uuid(), link: '/admin/cms-content/ReviewPageAdmin', name: 'Review Page' },
			// Remaining
			// { id: uuid(), link: '/LandingPage/components/FaqPage', name: 'FAQ Page' },
			

						
		]
	},
{
		id: uuid(),
		title: 'Service Management',
		icon: 'command',
		link:'admin/Services-Management',
		children: [
			{ id: uuid(), link: '/admin/Services-Management', name: 'Services' },
			{ id: uuid(), link: '/admin/Services-Management/Service-Types', name: 'Service Types' },
			{ id: uuid(), link: '/admin/Services-Management/Add-Ons', name: 'Add Ons' },
			{ id: uuid(), link: '/admin/Services-Management/accept-card-details', name: 'Accept Card Details' },			
		]
	},
{
		id: uuid(),
		title: 'Appointement Content',
		icon: 'layout',
		children: [
			
			{ id: uuid(), link: '/admin/appointment-content/Banner-Management', name: 'Landing Page' },
			
			// Remaining
			// { id: uuid(), link: '/LandingPage/components/FaqPage', name: 'FAQ Page' },
			

						
		]
	},
{
		id: uuid(),
		title: 'Blog Management',
		icon: 'info',
		link:'admin/Blog-Management',
		children: [
			{ id: uuid(), link: '/admin/Blog-Management/Blogs', name: 'Blogs' },
			{ id: uuid(), link: '/admin/Blog-Management', name: 'Page Details ' },
						
		]
	},	
	{
		id: uuid(),
		title: 'Article Management',
		icon: 'info',
		link:'admin/Article-Management',
		children: [
			{ id: uuid(), link: '/admin/Article-Management/Articles', name: 'Articles' },
			{ id: uuid(), link: '/admin/Master/Books', name: 'Books' },
			{ id: uuid(), link: '/admin/Article-Management', name: 'Books & Articles Page Details ' },
						
		]
	},
	{
		id: uuid(),
		title: 'Talks Management',
		icon: 'shopping-bag',
		link: '/admin/Talks'
	},
	{
		id: uuid(),
		title: 'FAQs Management',
		icon: 'info',
		link:'admin/Faqs',
		children: [
			{ id: uuid(), link: '/admin/Faqs', name: 'FAQs' },
			{ id: uuid(), link: '/admin/Faqs/FaqsBanner', name: 'Page Banner Details ' },
						
		]
	},

	{
		id: uuid(),
		title: 'Policies',
		icon: 'settings',
		children: [
		
			{ id: uuid(), link: '/admin/Policies/RegistrationPolicies', name: 'Privacy Policy' },
			{ id: uuid(), link: '/admin/Policies/Terms', name: 'Terms' },
			{ id: uuid(), link: '/admin/Policies/EcommerceRefund', name: 'Shop Refund ' },
			{ id: uuid(), link: '/admin/Policies/CancelationPolicies', name: 'Cancelation Policy ' },
			// { id: uuid(), link: '/admin/Master/GalleryImages', name: 'Gallery (Images)' },
			// { id: uuid(), link: '/admin/Master/GalleryVideos', name: 'Gallery (Videos)' },
			
						
		]
	},

	{
		id: uuid(),
		title: 'Master',
		icon: 'settings',
		children: [
		
			{ id: uuid(), link: '/admin/Master/CaseStoriesType', name: 'Case Studies Type' },
			{ id: uuid(), link: '/admin/Master/CaseStories', name: 'Case Studies ' },
			{ id: uuid(), link: '/admin/Master/ProjectSection', name: 'Project Section ' },
			{ id: uuid(), link: '/admin/Master/GalleryImages', name: 'Gallery (Images)' },
			{ id: uuid(), link: '/admin/Master/GalleryVideos', name: 'Gallery (Videos)' },
			
						
		]
	},


	{
		id: uuid(),
		title: 'About Amita',
		icon: 'user',
		link:'/admin/about-amita',
		children: [
			{ id: uuid(), link: '/admin/cms-content/AmitajainLandingPageAdmin', name: 'Page Content' },
			{ id: uuid(), link: '/admin/about-amita/view-enquiry', name: 'View Notes' },
			{ id: uuid(), link: '/admin/about-amita/ParticipationDetials', name: 'Participation-Details' },
						
		]
	},	
	{
		id: uuid(),
		title: 'Review',
		icon: 'star',
		link:'admin/orders',
		children: [
			// { id: uuid(), link: '/admin/review/testimonial', name: 'Testimonials' },
			{ id: uuid(), link: '/admin/review/testimonial', name: 'Customer Reviews' },
						
		]
	},		
{
		id: uuid(),
		title: 'Jobs Management',
		icon: 'layout',
		link: '/admin/cms/Jobs'
	},


	{
		id: uuid(),
		title: 'Donation Management',
		icon: 'dollar-sign',
		link:'/admin/donation',
		children: [
			{ id: uuid(), link: '/admin/donation/donation-page-content', name: 'Donation Page Content' },
			{ id: uuid(), link: '/admin/donation/Donation-Transactions', name: 'Donation Transactions' },
						
		]
	},	
	{
		id: uuid(),
		title: 'Footer Section',
		icon: 'command',
		link: '/admin/FooterForm'
	},	
	{
		id: uuid(),
		title: 'Our Business Details',
		icon: 'shopping-bag',
		link: '/admin/Business-Details'
	},
	{
		id: uuid(),
		title: 'Contact Management',
		icon: 'map-pin',
		link:'admin/center',
		children: [
			{ id: uuid(), link: '/admin/center', name: 'Centers ' },
			{ id: uuid(), link: '/admin/Contact-Management', name: 'Page Details' },
			{ id: uuid(), link: '/admin/Contact-Management/Enquiries', name: 'Enquiries' },
			{ id: uuid(), link: '/admin/center/Resource-Management', name: 'Resource-Management' },
						
		]
	},	


	// {
	// 	id: uuid(),
	// 	title: 'Orders',
	// 	icon: 'box',
	// 	link:'admin/orders',
	// 	children: [
	// 		{ id: uuid(), link: '/admin/orders', name: 'Order' },
	// 		// { id: uuid(), link: '/admin/inventory/add-product', name: 'Return & Replacements' },
						
	// 	]
	// },	
	
	
	
	// {
	// 	id: uuid(),
	// 	title: 'Dosha Test',
	// 	icon: 'book',
	// 	link: '/admin/dosha-test'
	// },
	// {
	// 	id: uuid(),
	// 	title: 'What is Ayurveda',
	// 	icon: 'info',
	// 	link: '/admin/about-ayurveda'
	// },

	// {
	// 	id: uuid(),
	// 	title: 'CMS',
	// 	icon: 'layout',
	// 	link: '/admin/cms'
	// },	
	
	// {
	// 	id: uuid(),
	// 	title: 'Roles & Permissions',
	// 	icon: 'lock',
	// 	children: [
	// 		{ id: uuid(), link: '/authentication/sign-in', name: 'Roles' },
	// 		{ id: uuid(), link: '/authentication/sign-up', name: 'Permissions' },
						
	// 	]
	// },
	
	// {
	// 	id: uuid(),
	// 	title: 'Notifications',
	// 	icon: 'bell',
	// 	children: [
	// 		{ id: uuid(), link: '/authentication/sign-in', name: 'Notification Templates' },
	// 		{ id: uuid(), link: '/authentication/sign-up', name: 'Configurations' },
						
	// 	]
	// },

	// {
	// 	id: uuid(),
	// 	title: 'Store Management',
	// 	icon: 'box',
	// 	link: '/admin/Store-Management'
	// },
		

			



		
	
	
];

export default DashboardMenu;
