// This file contains sample data that would typically come from your backend
// In a real application, you would pass this data to your EJS template

module.exports = {
  // Logo path
  logoPath: "/images/vistora.png",

  // Navigation items
  navItems: [
    { name: "HOME", link: "/", active: false },
    { name: "ROOMS/SUITES", link: "/rooms", active: false },
    { name: "DINING", link: "/dining", active: false },
    { name: "SPA & WELLNESS", link: "/spa", active: false },
    { name: "CONTACT US", link: "/contact", active: false },
    { name: "ABOUT US", link: "/about", active: false },
  ],

  // Date information for form defaults
  today: new Date().toISOString().split("T")[0],
  tomorrow: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0],

  // Guest options for dropdown
  guestOptions: [
    { value: "1a0c1r", label: "1 Adult, 0 Children - 1 Room" },
    { value: "2a0c1r", label: "2 Adults, 0 Children - 1 Room" },
    { value: "2a1c1r", label: "2 Adults, 1 Child - 1 Room" },
    { value: "2a2c1r", label: "2 Adults, 2 Children - 1 Room" },
    { value: "3a0c1r", label: "3 Adults, 0 Children - 1 Room" },
    { value: "4a0c2r", label: "4 Adults, 0 Children - 2 Rooms" },
  ],

  // Special codes for dropdown
  specialCodes: [
    { value: "promo", label: "Promo Code" },
    { value: "corporate", label: "Corporate Code" },
    { value: "member", label: "Member Discount" },
    { value: "group", label: "Group Booking" },
  ],

  // Footer links
  footerLinks: {
    quickLinks: [
      { label: "Home", url: "/" },
      { label: "Rooms & Suites", url: "/rooms" },
      { label: "Dining", url: "/dining" },
      { label: "Spa & Wellness", url: "/spa" },
      { label: "Events", url: "/events" },
      { label: "Gallery", url: "/gallery" },
    ],
    legal: [
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Terms of Use", url: "/terms" },
      { label: "Cookie Policy", url: "/cookies" },
    ],
  },

  // Contact information
  contactInfo: {
    email: "support@vistora.com",
    phone: "+1 800 987 6543",
    address: "123 Luxury Avenue, New York, NY 10001",
  },
}
