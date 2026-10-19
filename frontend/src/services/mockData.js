// Initial mock seed data for instant client-side testing when backend is offline
export const INITIAL_MOCK_EVENTS = [
    {
        _id: "evt-101",
        basicInfo: {
            title: "AI & Future Tech Summit 2026",
            description: "Join leading pioneers, researchers, and innovators in generative AI, quantum computing, and autonomous agents for an immersive 2-day flagship conference.",
            category: "TECH",
            tags: ["Artificial Intelligence", "Quantum", "Future Tech", "Keynote"],
            banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
        },
        schedule: {
            registrationStart: new Date(Date.now() - 7 * 86400000).toISOString(),
            registrationEnd: new Date(Date.now() + 14 * 86400000).toISOString(),
            startDate: new Date(Date.now() + 15 * 86400000).toISOString(),
            endDate: new Date(Date.now() + 17 * 86400000).toISOString()
        },
        venue: {
            mode: "HYBRID",
            venueName: "Silicon Convention Center",
            address: "100 Tech Blvd, Suite 400",
            city: "San Francisco, CA",
            meetingLink: "https://meet.eventpulse.live/ai-summit-2026"
        },
        capacity: {
            totalSeats: 500,
            availableSeats: 142,
            waitlistEnabled: true,
            waitlistLimit: 50
        },
        registration: {
            requiresApproval: false,
            maxTicketsPerUser: 3
        },
        policy: {
            cancellationAllowed: true,
            refundAllowed: true,
            terms: "Cancellation allowed up to 48 hours prior to start date."
        },
        organizer: {
            _id: "org-1",
            profile: { firstName: "Sarah", lastName: "Chen" },
            auth: { email: "sarah.chen@techfoundry.io" }
        },
        status: "REGISTRATION_OPEN",
        analytics: { views: 1840, registrations: 358, checkIns: 0 }
    },
    {
        _id: "evt-102",
        basicInfo: {
            title: "Global Full-Stack Web Development Bootcamp",
            description: "Hands-on intensive workshop building modern distributed web applications with Next.js, React 19, GraphQL, and microservices architecture.",
            category: "WORKSHOP",
            tags: ["React", "Node.js", "FullStack", "WebDev"],
            banner: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
        },
        schedule: {
            registrationStart: new Date(Date.now() - 10 * 86400000).toISOString(),
            registrationEnd: new Date(Date.now() + 5 * 86400000).toISOString(),
            startDate: new Date(Date.now() + 6 * 86400000).toISOString(),
            endDate: new Date(Date.now() + 7 * 86400000).toISOString()
        },
        venue: {
            mode: "ONLINE",
            meetingLink: "https://zoom.us/j/9876543210"
        },
        capacity: {
            totalSeats: 200,
            availableSeats: 35,
            waitlistEnabled: false,
            waitlistLimit: 0
        },
        registration: {
            requiresApproval: true,
            maxTicketsPerUser: 1
        },
        policy: {
            cancellationAllowed: true,
            refundAllowed: false,
            terms: "Requires background resume screening."
        },
        organizer: {
            _id: "org-2",
            profile: { firstName: "Alex", lastName: "Rivera" },
            auth: { email: "alex@devcraft.org" }
        },
        status: "REGISTRATION_OPEN",
        analytics: { views: 920, registrations: 165, checkIns: 0 }
    },
    {
        _id: "evt-103",
        basicInfo: {
            title: "HackTheGrid 2026 Cyber Security Hackathon",
            description: "36-hour capture-the-flag hackathon solving critical infrastructure vulnerabilities with $25,000 cash prizes for top technical teams.",
            category: "HACKATHON",
            tags: ["Security", "CTF", "Hackathon", "Prizes"],
            banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"
        },
        schedule: {
            registrationStart: new Date(Date.now() - 3 * 86400000).toISOString(),
            registrationEnd: new Date(Date.now() + 20 * 86400000).toISOString(),
            startDate: new Date(Date.now() + 22 * 86400000).toISOString(),
            endDate: new Date(Date.now() + 24 * 86400000).toISOString()
        },
        venue: {
            mode: "OFFLINE",
            venueName: "Metropolitan Expo Center",
            address: "777 Hackers Way",
            city: "Austin, TX"
        },
        capacity: {
            totalSeats: 300,
            availableSeats: 210,
            waitlistEnabled: true,
            waitlistLimit: 100
        },
        registration: {
            requiresApproval: false,
            maxTicketsPerUser: 4
        },
        policy: {
            cancellationAllowed: true,
            refundAllowed: true,
            terms: "Teams must adhere to ethical hacking code of conduct."
        },
        organizer: {
            _id: "org-1",
            profile: { firstName: "Sarah", lastName: "Chen" },
            auth: { email: "sarah.chen@techfoundry.io" }
        },
        status: "PUBLISHED",
        analytics: { views: 640, registrations: 90, checkIns: 0 }
    }
];

export const INITIAL_MOCK_USERS = [
    {
        _id: "usr-attendee",
        profile: { firstName: "Ayush", lastName: "Rajput", avatar: null },
        auth: { email: "attendee@eventpulse.io", isVerified: true, lastLogin: new Date().toISOString() },
        authorization: { role: "ATTENDEE", extraPermissions: [] },
        account: { status: "ACTIVE", suspendedUntil: null, suspensionReason: "" },
        loginCount: 12,
        lastSeen: new Date().toISOString()
    },
    {
        _id: "org-1",
        profile: { firstName: "Sarah", lastName: "Chen", avatar: null },
        auth: { email: "organizer@eventpulse.io", isVerified: true, lastLogin: new Date().toISOString() },
        authorization: { role: "VERIFIED_ORGANIZER", extraPermissions: [] },
        account: { status: "ACTIVE", suspendedUntil: null, suspensionReason: "" },
        loginCount: 45,
        lastSeen: new Date().toISOString()
    },
    {
        _id: "usr-admin",
        profile: { firstName: "System", lastName: "Administrator", avatar: null },
        auth: { email: "admin@eventpulse.io", isVerified: true, lastLogin: new Date().toISOString() },
        authorization: { role: "ADMIN", extraPermissions: ["ALL"] },
        account: { status: "ACTIVE", suspendedUntil: null, suspensionReason: "" },
        loginCount: 98,
        lastSeen: new Date().toISOString()
    }
];

export const INITIAL_MOCK_APPLICATIONS = [
    {
        _id: "app-301",
        applicant: {
            _id: "usr-attendee",
            profile: { firstName: "Ayush", lastName: "Rajput" },
            auth: { email: "attendee@eventpulse.io" },
            authorization: { role: "ATTENDEE" }
        },
        organization: {
            name: "Nexus Innovators Club",
            website: "https://nexusinnovators.org",
            description: "Student-run technological community organizing code sprints and design workshops."
        },
        eventExperience: {
            totalEventsHosted: 8,
            largestAudience: 450,
            experienceDescription: "Hosted national coding hackathons and university design summits with industry mentors."
        },
        socialLinks: {
            linkedin: "https://linkedin.com/in/ayushrajput",
            github: "https://github.com/ayushrajput1107",
            portfolio: "https://ayushrajput.dev"
        },
        documents: [
            { documentType: "COLLEGE_ID", documentUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80" }
        ],
        status: "PENDING",
        createdAt: new Date().toISOString()
    }
];

export const INITIAL_MOCK_REGISTRATIONS = [
    {
        _id: "reg-501",
        event: INITIAL_MOCK_EVENTS[0],
        user: "usr-attendee",
        ticketCount: 2,
        status: "CONFIRMED",
        registeredAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
];
