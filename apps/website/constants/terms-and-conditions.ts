import type { LegalDocument } from "@/types/legal.types";

export const TERMS_AND_CONDITIONS: LegalDocument = {
  effectiveDate: "September 2, 2026",
  lastUpdated: "September 2, 2026",
  intro:
    "These Terms govern your use of usalimocorp.com and transportation services arranged by USA Limousine Corporation. Please review them before completing a reservation.",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms & Conditions (“Terms”) govern your access to usalimocorp.com and your purchase or use of transportation services offered or arranged by USA Limousine Corporation (“USA Limousine,” “Company,” “we,” “us,” or “our”).",
        },
        {
          type: "paragraph",
          text: "By accessing our Website, requesting a quote, submitting a reservation, making a payment, or using our transportation services, you agree to these Terms.",
        },
        {
          type: "paragraph",
          text: "Please read these Terms carefully before completing a reservation.",
        },
      ],
    },
    {
      id: "eligibility",
      title: "Eligibility",
      blocks: [
        {
          type: "paragraph",
          text: "You must be at least 18 years old and legally capable of entering into a binding agreement to make a reservation through our Website.",
        },
        {
          type: "paragraph",
          text: "If you make a reservation on behalf of another passenger, company, organization, or group, you represent that you are authorized to make the reservation and accept these Terms on their behalf.",
        },
        {
          type: "paragraph",
          text: "The person making the reservation is responsible for the reservation and for communicating applicable policies and instructions to all passengers associated with the booking.",
        },
      ],
    },
    {
      id: "reservations",
      title: "Reservations",
      blocks: [
        {
          type: "paragraph",
          text: "Customers may request transportation through our Website or another booking method authorized by USA Limousine Corporation.",
        },
        {
          type: "paragraph",
          text: "A reservation is considered confirmed after USA Limousine Corporation accepts the reservation and issues a booking confirmation or otherwise confirms acceptance.",
        },
        {
          type: "paragraph",
          text: "Customers are responsible for providing accurate information, including:",
        },
        {
          type: "list",
          items: [
            "Passenger name",
            "Telephone number",
            "Email address",
            "Pickup address",
            "Destination",
            "Pickup date",
            "Pickup time",
            "Flight information, when applicable",
            "Passenger count",
            "Luggage quantity",
            "Appropriate vehicle selection",
            "Additional stops",
            "Special requests",
          ],
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation is not responsible for delays, missed pickups, incorrect routing, or additional costs caused by inaccurate, incomplete, or outdated information provided by the customer.",
        },
      ],
    },
    {
      id: "pricing",
      title: "Pricing",
      blocks: [
        {
          type: "paragraph",
          text: "Transportation prices are based on the information provided at the time of booking.",
        },
        { type: "paragraph", text: "Pricing may take into consideration:" },
        {
          type: "list",
          items: [
            "Vehicle category",
            "Distance",
            "Duration",
            "Pickup location",
            "Destination",
            "Service type",
            "Number of stops",
            "Waiting time",
            "Tolls",
            "Parking",
            "Airport fees",
            "Facility fees",
            "Special requests",
            "Applicable taxes",
            "Applicable fees or surcharges",
            "Other requirements associated with the reservation",
          ],
        },
        {
          type: "paragraph",
          text: "The final amount displayed during checkout or provided in a confirmed quote governs unless the itinerary or service requirements subsequently change.",
        },
        {
          type: "paragraph",
          text: "Unless otherwise stated during checkout or in a written agreement, the full reservation amount will be charged at the time the booking is completed.",
        },
      ],
    },
    {
      id: "gratuity",
      title: "Gratuity",
      blocks: [
        {
          type: "paragraph",
          text: "A 20% chauffeur gratuity is automatically added to reservations unless otherwise specifically stated during checkout or in the customer's written quote or booking confirmation.",
        },
        {
          type: "paragraph",
          text: "Customers may provide an additional gratuity at their discretion.",
        },
        {
          type: "paragraph",
          text: "The applicable gratuity will be disclosed as part of the reservation price before the booking is completed.",
        },
      ],
    },
    {
      id: "payment-authorization",
      title: "Payment Authorization",
      blocks: [
        {
          type: "paragraph",
          text: "By submitting a payment method, you represent that you are authorized to use the payment method provided.",
        },
        {
          type: "paragraph",
          text: "You authorize USA Limousine Corporation and its payment-processing providers to charge the amounts associated with your confirmed reservation.",
        },
        { type: "paragraph", text: "Additional amounts may become payable because of:" },
        {
          type: "list",
          items: [
            "Customer-requested itinerary changes",
            "Additional stops",
            "Additional mileage",
            "Extended service time",
            "Waiting time",
            "Tolls",
            "Parking",
            "Airport or facility fees",
            "Excessive cleaning",
            "Passenger-caused vehicle damage",
            "Other properly disclosed charges",
          ],
        },
        {
          type: "paragraph",
          text: "Such charges may be processed using the payment method associated with the reservation to the extent permitted by applicable law and the customer's payment authorization.",
        },
      ],
    },
    {
      id: "reservation-changes",
      title: "Reservation Changes",
      blocks: [
        {
          type: "paragraph",
          text: "Customers should contact USA Limousine Corporation as soon as possible if they need to modify:",
        },
        {
          type: "list",
          items: [
            "Pickup time",
            "Pickup location",
            "Destination",
            "Passenger count",
            "Luggage quantity",
            "Vehicle category",
            "Flight information",
            "Number of stops",
            "Service duration",
            "Other reservation details",
          ],
        },
        { type: "paragraph", text: "Changes are subject to availability." },
        { type: "paragraph", text: "Changing a reservation may change the price." },
        {
          type: "paragraph",
          text: "Material changes requested after a chauffeur has been assigned, dispatched, or after service begins may result in additional charges.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation is not required to accommodate a requested change when doing so would be unsafe, unlawful, operationally impractical, or interfere with another confirmed reservation.",
        },
      ],
    },
    {
      id: "cancellation-refund-policy",
      title: "Cancellation & Refund Policy",
      blocks: [
        {
          type: "paragraph",
          text: "USA Limousine Corporation understands that travel plans may change.",
        },
        {
          type: "paragraph",
          text: "Unless different cancellation terms are specifically stated in a quote, booking confirmation, contract, or service agreement, the following cancellation policy applies.",
        },
        {
          type: "terms",
          items: [
            {
              term: "More Than 24 Hours Before Pickup",
              text: "If a reservation is cancelled more than 24 hours before the scheduled pickup time, a 5% cancellation fee will be deducted from the total reservation amount. The remaining 95% will be refunded.",
            },
            {
              term: "Between 8 and 24 Hours Before Pickup",
              text: "If a reservation is cancelled between 8 and 24 hours before the scheduled pickup time, a 15% cancellation fee will be deducted from the total reservation amount. The remaining 85% will be refunded.",
            },
            {
              term: "Less Than 8 Hours Before Pickup",
              text: "If a reservation is cancelled less than 8 hours before the scheduled pickup time, a 50% cancellation fee will be deducted from the total reservation amount. The remaining 50% will be refunded.",
            },
            {
              term: "Chauffeur Dispatched or En Route",
              text: "If the chauffeur has already been dispatched or is traveling to the scheduled pickup location when the reservation is cancelled, a 75% cancellation fee will apply. The remaining 25% will be refunded.",
            },
            {
              term: "Chauffeur Already at Pickup Location",
              text: "If the chauffeur has arrived at the designated pickup location and the customer cancels the reservation, a 75% cancellation fee will apply. The remaining 25% will be refunded.",
            },
            { term: "No-Show", text: "If the passenger:" },
          ],
        },
        {
          type: "list",
          items: [
            "Does not appear for the scheduled pickup",
            "Cannot be contacted after reasonable attempts",
            "Leaves the pickup location without notifying us",
            "Fails to meet the chauffeur within the applicable waiting period",
          ],
        },
        {
          type: "paragraph",
          text: "The reservation may be considered a no-show. A no-show is 100% non-refundable.",
        },
        {
          type: "paragraph",
          text: "Additional expenses already incurred in connection with the reservation may also be deducted from any applicable refund. These expenses may include:",
        },
        {
          type: "list",
          items: [
            "Tolls",
            "Parking",
            "Airport fees",
            "Facility fees",
            "Permits",
            "Third-party transportation charges",
            "Other non-refundable expenses incurred specifically for the reservation",
          ],
        },
        {
          type: "paragraph",
          text: "Cancellation percentages are calculated using the total amount paid for the applicable reservation unless otherwise specifically stated.",
        },
        {
          type: "paragraph",
          text: "Approved refunds will generally be returned to the original payment method. Refund processing times depend on the customer's card issuer, financial institution, and payment processor.",
        },
        {
          type: "paragraph",
          text: "Reservation-specific cancellation terms disclosed in writing will control if they differ from this general cancellation policy.",
        },
      ],
    },
    {
      id: "waiting-time-policy",
      title: "Waiting Time Policy",
      blocks: [
        {
          type: "paragraph",
          text: "USA Limousine Corporation provides complimentary waiting time to allow passengers a reasonable period to meet their chauffeur.",
        },
        {
          type: "terms",
          items: [
            {
              term: "Domestic Airport Arrivals",
              text: "30 minutes of complimentary waiting time is included. After the complimentary period, waiting time is charged at $1.25 per additional minute.",
            },
            {
              term: "International Airport Arrivals",
              text: "45 minutes of complimentary waiting time is included. After the complimentary period, waiting time is charged at $1.25 per additional minute.",
            },
            {
              term: "Home, Hotel, Business and Other Non-Airport Pickups",
              text: "15 minutes of complimentary waiting time is included. After the complimentary period, waiting time is charged at $1.25 per additional minute. For non-airport pickups, the complimentary waiting period begins at the scheduled reservation pickup time.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "When accurate flight information is provided, USA Limousine Corporation may monitor publicly available flight information. For airport pickups, complimentary waiting time generally begins based on the flight's recorded arrival time unless different instructions or terms are provided for the reservation.",
        },
        {
          type: "paragraph",
          text: "Flight tracking does not eliminate waiting-time charges resulting from extended baggage delays, customs or immigration delays, passenger delays, or other circumstances after the complimentary waiting period has expired.",
        },
        {
          type: "paragraph",
          text: "After the complimentary waiting period expires, waiting time will be calculated at $1.25 per minute until the passenger enters the vehicle or the reservation is terminated.",
        },
        {
          type: "paragraph",
          text: "When reasonably practical, USA Limousine Corporation or the chauffeur may notify the customer when complimentary waiting time has expired. Waiting-time charges may be added to the reservation during or after the trip.",
        },
        {
          type: "paragraph",
          text: "Extended waiting is subject to chauffeur and vehicle availability. If continued waiting would interfere with another confirmed reservation, USA Limousine Corporation reserves the right to terminate the reservation after reasonable attempts to contact the passenger. A terminated reservation resulting from the passenger's failure to appear may be classified as a no-show.",
        },
      ],
    },
    {
      id: "airport-transportation",
      title: "Airport Transportation",
      blocks: [
        { type: "paragraph", text: "Customers are responsible for providing accurate:" },
        {
          type: "list",
          items: [
            "Airline information",
            "Flight number",
            "Arrival or departure date",
            "Airport",
            "Relevant terminal information, when available",
          ],
        },
        {
          type: "paragraph",
          text: "When accurate flight information is provided, USA Limousine Corporation may monitor publicly available flight information to assist with pickup coordination.",
        },
        {
          type: "paragraph",
          text: "Flight monitoring is provided as a convenience and does not relieve passengers of their responsibility to provide accurate flight details or communicate material changes.",
        },
        { type: "paragraph", text: "USA Limousine Corporation is not responsible for:" },
        {
          type: "list",
          items: [
            "Airline cancellations",
            "Flight diversions",
            "Baggage delays",
            "Customs delays",
            "Immigration delays",
            "Airport closures",
            "Security restrictions",
            "Terminal changes",
            "Ground-transportation restrictions",
            "Airport congestion",
            "Airline schedule errors",
            "Other circumstances outside our reasonable control",
          ],
        },
        {
          type: "paragraph",
          text: "Waiting-time, parking, airport, or other charges may apply when permitted under the applicable reservation terms.",
        },
      ],
    },
    {
      id: "additional-stops-tolls-parking",
      title: "Additional Stops, Tolls, Parking & Route Changes",
      blocks: [
        {
          type: "paragraph",
          text: "The reservation price is based on the itinerary provided when the reservation is confirmed.",
        },
        { type: "paragraph", text: "Additional charges may apply for:" },
        {
          type: "list",
          items: [
            "Additional stops",
            "Material destination changes",
            "Extended mileage",
            "Extended service time",
            "Tolls",
            "Parking",
            "Airport fees",
            "Facility fees",
            "Customer-requested detours",
            "Waiting time",
            "Other material changes to the original itinerary",
          ],
        },
        {
          type: "paragraph",
          text: "Tolls will be charged at the actual applicable amount incurred. Parking will be charged at the actual applicable amount incurred. Applicable airport or facility fees may also be charged separately.",
        },
        {
          type: "paragraph",
          text: "Additional stops or route changes may be priced according to the additional time, mileage, or applicable vehicle rate. Whenever reasonably practical, additional charges will be communicated to the customer.",
        },
        {
          type: "paragraph",
          text: "The chauffeur may select an appropriate route based on traffic, road closures, construction, weather, safety, navigation information, airport restrictions, police activity, or other driving conditions. The shortest geographical route is not necessarily the fastest, safest, or most appropriate route.",
        },
      ],
    },
    {
      id: "passenger-luggage-capacity",
      title: "Passenger and Luggage Capacity",
      blocks: [
        {
          type: "paragraph",
          text: "Customers must reserve a vehicle suitable for the number of passengers and amount of luggage traveling.",
        },
        {
          type: "paragraph",
          text: "The number of passengers may not exceed the legal or designated seating capacity of the vehicle.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation or the chauffeur may refuse to transport passengers or luggage when doing so would:",
        },
        {
          type: "list",
          items: [
            "Exceed vehicle capacity",
            "Create an unsafe condition",
            "Block the chauffeur's visibility",
            "Interfere with safety equipment",
            "Violate applicable law",
            "Risk damage to the vehicle",
          ],
        },
        {
          type: "paragraph",
          text: "If the information provided when booking understates the passenger or luggage requirements, a larger or additional vehicle may be necessary. Additional charges may apply. Availability of an alternate or additional vehicle is not guaranteed.",
        },
      ],
    },
    {
      id: "child-seats",
      title: "Child Seats",
      blocks: [
        {
          type: "paragraph",
          text: "Customers requesting child seats must provide accurate information regarding the number and type of seats required.",
        },
        { type: "paragraph", text: "Child-seat availability must be confirmed." },
        {
          type: "paragraph",
          text: "Parents, guardians, or responsible adults remain responsible for ensuring children are transported in compliance with applicable law.",
        },
      ],
    },
    {
      id: "passenger-conduct",
      title: "Passenger Conduct",
      blocks: [
        {
          type: "paragraph",
          text: "Passengers must behave in a lawful, safe, and reasonably respectful manner.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation and its chauffeurs reserve the right to refuse, terminate, or suspend transportation when a passenger:",
        },
        {
          type: "list",
          items: [
            "Threatens a chauffeur",
            "Threatens another passenger",
            "Harasses a chauffeur or passenger",
            "Engages in violent behavior",
            "Engages in dangerous conduct",
            "Interferes with operation of the vehicle",
            "Damages or attempts to damage the vehicle",
            "Possesses unlawful items",
            "Requests that the chauffeur violate applicable law",
            "Creates an unsafe transportation environment",
            "Engages in conduct that could reasonably endanger passengers, the chauffeur, the vehicle, or the public",
          ],
        },
        {
          type: "paragraph",
          text: "Service terminated because of serious passenger misconduct may be 100% non-refundable to the extent permitted by applicable law.",
        },
      ],
    },
    {
      id: "smoking-vaping-policy",
      title: "Smoking & Vaping Policy",
      blocks: [
        {
          type: "paragraph",
          text: "Smoking and vaping of any kind are prohibited inside USA Limousine Corporation vehicles. This includes:",
        },
        {
          type: "list",
          items: [
            "Cigarettes",
            "Cigars",
            "Electronic cigarettes",
            "Vape devices",
            "Marijuana or cannabis",
            "Other smoked or vaporized substances",
          ],
        },
        {
          type: "paragraph",
          text: "If there is evidence of smoking or vaping inside a vehicle, a $250 cleaning and deodorizing fee may be charged to the reservation holder.",
        },
        {
          type: "paragraph",
          text: "Any burn damage, staining, permanent odor damage, or other physical damage will be charged separately based on the reasonable repair or replacement cost.",
        },
      ],
    },
    {
      id: "vomiting-cleaning-fee",
      title: "Vomiting & Bodily Fluid Cleaning Fee",
      blocks: [
        {
          type: "paragraph",
          text: "If a passenger vomits or causes bodily fluids to contaminate the interior of a vehicle, a mandatory $250 cleaning and sanitization fee will be charged to the reservation holder.",
        },
        {
          type: "paragraph",
          text: "This fee is intended to cover professional cleaning, sanitation, deodorizing, and the time during which the vehicle may be unavailable for transportation service.",
        },
        {
          type: "paragraph",
          text: "If professional cleaning or repair expenses directly resulting from the incident exceed $250, USA Limousine Corporation reserves the right to charge the documented additional cost.",
        },
      ],
    },
    {
      id: "excessive-cleaning-policy",
      title: "Excessive Cleaning Policy",
      blocks: [
        {
          type: "paragraph",
          text: "Passengers are expected to leave the vehicle in reasonably clean condition.",
        },
        {
          type: "paragraph",
          text: "A cleaning fee of up to $250 may be charged when a vehicle requires cleaning beyond normal use because of:",
        },
        {
          type: "list",
          items: [
            "Excessive food spills",
            "Beverage spills",
            "Stains",
            "Excessive trash",
            "Mud",
            "Excessive dirt or debris",
            "Bodily fluids",
            "Strong or persistent odors",
            "Other excessive soiling",
          ],
        },
        {
          type: "paragraph",
          text: "Normal use of the vehicle will not result in a cleaning charge.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation may document the condition of a vehicle using photographs, video, cleaning invoices, receipts, or other reasonable evidence.",
        },
      ],
    },
    {
      id: "vehicle-damage-policy",
      title: "Vehicle Damage Policy",
      blocks: [
        {
          type: "paragraph",
          text: "The reservation holder may be financially responsible for damage caused by the customer, a passenger, or a child associated with the reservation.",
        },
        { type: "paragraph", text: "Damage may include damage to:" },
        {
          type: "list",
          items: [
            "Seats",
            "Upholstery",
            "Carpeting",
            "Headliners",
            "Doors",
            "Door panels",
            "Windows",
            "Interior trim",
            "Screens",
            "Entertainment equipment",
            "Charging equipment",
            "Vehicle controls",
            "Cupholders",
            "Fixtures",
            "Accessories",
            "Exterior body components",
            "Other vehicle property",
          ],
        },
        {
          type: "paragraph",
          text: "The reservation holder may be charged 100% of the reasonable repair or replacement cost associated with passenger-caused damage.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation may use photographs, video, repair estimates, repair invoices, cleaning invoices, professional assessments, and other reasonable documentation to establish the nature and cost of damage.",
        },
        { type: "paragraph", text: "Normal wear and tear is excluded." },
      ],
    },
    {
      id: "lost-damaged-equipment",
      title: "Lost or Damaged Company Equipment",
      blocks: [
        {
          type: "paragraph",
          text: "Any equipment, accessory, or property belonging to USA Limousine Corporation that is intentionally or negligently damaged, removed, or lost by a passenger may be charged to the reservation holder at the full reasonable repair or replacement cost.",
        },
      ],
    },
    {
      id: "seat-belts-safety",
      title: "Seat Belts & Passenger Safety",
      blocks: [
        {
          type: "paragraph",
          text: "Passengers should use available seat belts and comply with applicable safety laws.",
        },
        {
          type: "paragraph",
          text: "Passengers must follow reasonable safety instructions provided by the chauffeur.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation will not require or permit a chauffeur to:",
        },
        {
          type: "list",
          items: [
            "Speed at a customer's request",
            "Drive recklessly",
            "Drive unsafely",
            "Park illegally",
            "Violate traffic laws",
            "Enter prohibited areas",
            "Violate airport rules",
            "Operate a vehicle when conditions are reasonably considered unsafe",
          ],
        },
        {
          type: "paragraph",
          text: "Passenger requests cannot override applicable safety requirements or law.",
        },
      ],
    },
    {
      id: "service-delays",
      title: "Service Delays",
      blocks: [
        {
          type: "paragraph",
          text: "Pickup and arrival times may be affected by circumstances outside USA Limousine Corporation's reasonable control, including:",
        },
        {
          type: "list",
          items: [
            "Traffic congestion",
            "Road construction",
            "Motor vehicle accidents",
            "Weather",
            "Flooding",
            "Snow or ice",
            "Road closures",
            "Airport congestion",
            "Security restrictions",
            "Police activity",
            "Special events",
            "Government actions",
            "Mechanical problems",
            "Emergency conditions",
            "Other unforeseen circumstances",
          ],
        },
        {
          type: "paragraph",
          text: "Although we make reasonable efforts to provide timely transportation, USA Limousine Corporation cannot guarantee that a passenger will arrive at a flight, meeting, appointment, event, reservation, or connection at a particular time.",
        },
        {
          type: "paragraph",
          text: "Customers are responsible for allowing sufficient travel time.",
        },
      ],
    },
    {
      id: "vehicle-substitution",
      title: "Vehicle Substitution",
      blocks: [
        {
          type: "paragraph",
          text: "USA Limousine Corporation makes reasonable efforts to provide the vehicle category selected or confirmed.",
        },
        {
          type: "paragraph",
          text: "Unless specifically guaranteed in writing, a particular vehicle make, model, model year, color, trim, chauffeur, interior configuration, individual vehicle, or feature is not guaranteed.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation may substitute a comparable or higher-category vehicle when reasonably necessary because of mechanical problems, maintenance, scheduling, safety, availability, emergency circumstances, or other operational reasons.",
        },
      ],
    },
    {
      id: "transportation-partners",
      title: "Transportation Partners, Affiliates & Independent Providers",
      blocks: [
        {
          type: "paragraph",
          text: "USA Limousine Corporation may perform transportation directly or arrange transportation using chauffeurs, affiliates, independent transportation providers, subcontractors, or other transportation partners.",
        },
        {
          type: "paragraph",
          text: "By making a reservation, you authorize USA Limousine Corporation to provide such providers with information reasonably necessary to complete the requested transportation.",
        },
      ],
    },
    {
      id: "lost-property",
      title: "Lost or Forgotten Property",
      blocks: [
        {
          type: "paragraph",
          text: "Passengers are responsible for their personal belongings.",
        },
        {
          type: "paragraph",
          text: "Before exiting the vehicle, passengers should check for phones, wallets, bags, luggage, identification, passports, keys, electronic devices, and other personal property.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation is not responsible for items left in a vehicle except to the extent responsibility is imposed by applicable law.",
        },
        {
          type: "paragraph",
          text: "If a lost item is located, we will make reasonable efforts to assist with its return. Shipping, courier, delivery, postage, chauffeur travel, or transportation expenses associated with returning an item may be charged to the customer.",
        },
      ],
    },
    {
      id: "personal-purchases",
      title: "Personal Purchases, Gift Cards & Errands",
      blocks: [
        {
          type: "paragraph",
          text: "Unless specifically agreed to in advance as part of the transportation service, chauffeurs are not required to make purchases on behalf of passengers.",
        },
        {
          type: "paragraph",
          text: "Chauffeurs may refuse requests involving gift cards, money transfers, cash advances, financial transactions, personal purchases, illegal goods, restricted items, or other transactions unrelated to the transportation service.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation is not responsible for fulfilling unauthorized or unrelated purchasing requests made to a chauffeur.",
        },
      ],
    },
    {
      id: "chargebacks-disputes",
      title: "Chargebacks & Payment Disputes",
      blocks: [
        {
          type: "paragraph",
          text: "Customers should contact USA Limousine Corporation promptly if they believe a charge is incorrect at info@usalimocorp.com.",
        },
        {
          type: "paragraph",
          text: "We will make reasonable efforts to investigate legitimate billing concerns.",
        },
        {
          type: "paragraph",
          text: "Initiating a chargeback, card dispute, or payment dispute does not eliminate amounts properly owed for transportation performed or charges authorized under the reservation.",
        },
        {
          type: "paragraph",
          text: "When responding to a payment dispute, USA Limousine Corporation may provide relevant documentation to payment processors, banks, credit card issuers, or financial institutions, including reservation records, booking confirmations, payment records, customer communications, chauffeur communications, trip information, pickup or drop-off documentation, GPS or location records when available, photographs, cleaning or repair documentation, and other evidence reasonably relevant to the disputed transaction.",
        },
      ],
    },
    {
      id: "additional-charges-summary",
      title: "Summary of Common Additional Charges",
      blocks: [
        {
          type: "paragraph",
          text: "Unless different terms are specifically disclosed for a reservation, common additional charges include:",
        },
        {
          type: "terms",
          items: [
            {
              term: "Waiting Time",
              text: "$1.25 per minute after the complimentary waiting period",
            },
            { term: "Tolls", text: "Actual amount incurred" },
            { term: "Parking", text: "Actual amount incurred" },
            { term: "Airport or Facility Fees", text: "Actual applicable amount" },
            {
              term: "Additional Stops",
              text: "Based on additional time, mileage, and applicable vehicle pricing",
            },
            {
              term: "Additional Mileage",
              text: "Charged according to the applicable vehicle's additional-mileage rate",
            },
            {
              term: "Customer-Requested Detours",
              text: "Additional time and/or mileage charges may apply",
            },
            {
              term: "Extended Hourly Service",
              text: "Charged according to the applicable vehicle's hourly rate",
            },
            { term: "Vomiting/Bodily Fluid Cleaning", text: "$250 minimum" },
            { term: "Smoking/Vaping Cleaning", text: "$250" },
            { term: "Other Excessive Cleaning", text: "Up to $250" },
            {
              term: "Passenger-Caused Vehicle Damage",
              text: "100% of the reasonable documented repair or replacement cost",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Some charges may not be known until during or after transportation has been completed.",
        },
      ],
    },
    {
      id: "communications",
      title: "Communications",
      blocks: [
        {
          type: "paragraph",
          text: "By providing contact information and making a reservation, you authorize USA Limousine Corporation to contact you regarding your reservation or transportation service through the communication methods you provide.",
        },
        {
          type: "paragraph",
          text: "Communications may include reservation confirmations, payment information, chauffeur details, pickup instructions, chauffeur arrival notices, trip updates, flight-related information, reservation changes, delays, and customer-service communications.",
        },
        {
          type: "paragraph",
          text: "Marketing communications will be handled in accordance with applicable consent and opt-out requirements.",
        },
      ],
    },
    {
      id: "sms-terms",
      title: "SMS Terms",
      blocks: [
        {
          type: "paragraph",
          text: "If you consent to receive applicable SMS messages from USA Limousine Corporation:",
        },
        {
          type: "list",
          items: [
            "Message frequency may vary.",
            "Message and data rates may apply.",
            "Reply STOP to applicable messages to opt out.",
            "Reply HELP for assistance.",
          ],
        },
        {
          type: "paragraph",
          text: "SMS consent is not sold or shared with third parties or affiliates for their own marketing purposes.",
        },
        {
          type: "paragraph",
          text: "Where legally required, consent to receive promotional SMS messages is not a condition of purchasing transportation services.",
        },
      ],
    },
    {
      id: "website-use",
      title: "Website Use",
      blocks: [
        { type: "paragraph", text: "You agree not to:" },
        {
          type: "list",
          items: [
            "Use our Website for fraudulent purposes",
            "Submit false reservation information",
            "Make fraudulent bookings",
            "Use another person's payment information without authorization",
            "Attempt unauthorized access to our systems",
            "Introduce viruses or malicious software",
            "Interfere with Website security",
            "Attempt to bypass Website protections",
            "Scrape or misuse Website information",
            "Impersonate another person",
            "Engage in activity designed to interfere with Website operation",
          ],
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation may restrict or terminate access to its Website when reasonably necessary to prevent fraud, abuse, security threats, or unlawful activity.",
        },
      ],
    },
    {
      id: "website-information-errors",
      title: "Website Information & Errors",
      blocks: [
        {
          type: "paragraph",
          text: "USA Limousine Corporation makes reasonable efforts to maintain accurate prices, vehicle descriptions, availability information, service descriptions, and Website content.",
        },
        {
          type: "paragraph",
          text: "However, typographical errors, technical problems, pricing errors, system errors, and outdated information may occasionally occur.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation reserves the right to correct obvious errors. If an error materially affects a reservation, we may contact the customer to correct the reservation, adjust the amount where appropriate, or provide another reasonable resolution.",
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      blocks: [
        {
          type: "paragraph",
          text: "Unless otherwise indicated, content appearing on the USA Limousine Corporation Website is owned by, licensed to, or used with authorization by USA Limousine Corporation.",
        },
        {
          type: "paragraph",
          text: "This may include company name, logos, branding, website design, photographs, graphics, text, videos, service descriptions, and other proprietary materials.",
        },
        {
          type: "paragraph",
          text: "Such materials may not be copied, reproduced, republished, distributed, altered, or commercially exploited without authorization except as permitted by applicable law.",
        },
      ],
    },
    {
      id: "disclaimer-of-warranties",
      title: "Disclaimer of Warranties",
      blocks: [
        {
          type: "paragraph",
          text: "To the fullest extent permitted by applicable law, the Website is provided on an “as available” basis.",
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation does not guarantee that the Website will always be uninterrupted, error-free, secure, continuously available, or free from technical problems.",
        },
        {
          type: "paragraph",
          text: "Nothing in these Terms excludes warranties or consumer rights that cannot legally be excluded.",
        },
      ],
    },
    {
      id: "limitation-of-liability",
      title: "Limitation of Liability",
      blocks: [
        {
          type: "paragraph",
          text: "To the fullest extent permitted by applicable law, USA Limousine Corporation will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from the Website or transportation services.",
        },
        {
          type: "paragraph",
          text: "This may include losses associated with missed flights, missed trains, missed meetings, missed appointments, missed events, missed reservations, missed connecting transportation, lost business opportunities, and travel disruptions when such losses result from circumstances outside our reasonable control or where liability may otherwise lawfully be limited.",
        },
        {
          type: "paragraph",
          text: "Nothing in these Terms limits liability that cannot legally be limited or excluded.",
        },
      ],
    },
    {
      id: "force-majeure",
      title: "Force Majeure",
      blocks: [
        {
          type: "paragraph",
          text: "USA Limousine Corporation will not be responsible for a failure or delay in performance caused by circumstances beyond our reasonable control, including:",
        },
        {
          type: "list",
          items: [
            "Severe weather",
            "Flooding",
            "Snowstorms",
            "Natural disasters",
            "Road closures",
            "Major traffic incidents",
            "Government actions",
            "Civil emergencies",
            "Labor disruptions",
            "Airport closures",
            "Security incidents",
            "Public emergencies",
            "Utility failures",
            "Telecommunications failures",
            "Widespread technology outages",
            "Other similar events outside our reasonable control",
          ],
        },
        {
          type: "paragraph",
          text: "USA Limousine Corporation will make reasonable efforts to communicate with affected customers and provide available alternatives when practical.",
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy",
      blocks: [
        {
          type: "paragraph",
          text: "Use of our Website and transportation services is also governed by the USA Limousine Corporation Privacy Policy.",
        },
        {
          type: "paragraph",
          text: "The Privacy Policy is incorporated into these Terms by reference.",
        },
      ],
    },
    {
      id: "governing-law",
      title: "Governing Law",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms and any dispute arising from the Website or services will be governed by the laws of the State of New Jersey, without regard to conflict-of-law principles, except where applicable federal law or another mandatory law controls.",
        },
        {
          type: "paragraph",
          text: "Any legal proceeding will be brought before a court having appropriate jurisdiction in New Jersey unless applicable law requires otherwise.",
        },
      ],
    },
    {
      id: "severability",
      title: "Severability",
      blocks: [
        {
          type: "paragraph",
          text: "If any provision of these Terms is determined to be unlawful, invalid, or unenforceable, that provision will be enforced to the maximum extent permitted by law.",
        },
        {
          type: "paragraph",
          text: "The remaining provisions will continue in full force and effect.",
        },
      ],
    },
    {
      id: "no-waiver",
      title: "No Waiver",
      blocks: [
        {
          type: "paragraph",
          text: "Failure by USA Limousine Corporation to enforce a provision of these Terms does not constitute a waiver of that provision or any other right.",
        },
      ],
    },
    {
      id: "changes-to-terms",
      title: "Changes to These Terms",
      blocks: [
        {
          type: "paragraph",
          text: "USA Limousine Corporation may update these Terms periodically to reflect changes in transportation services, business operations, website functionality, pricing practices, technology, legal requirements, and regulatory requirements.",
        },
        {
          type: "paragraph",
          text: "Updated Terms will be posted on our Website with a revised “Last Updated” date.",
        },
        {
          type: "paragraph",
          text: "Changes will generally apply prospectively unless applicable law permits or requires otherwise.",
        },
        {
          type: "paragraph",
          text: "Terms applicable to an already confirmed reservation will generally be those provided or in effect when the reservation was made, except where a change is required by law or agreed upon by the customer.",
        },
      ],
    },
    {
      id: "entire-agreement",
      title: "Entire Agreement",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms, together with the customer's reservation confirmation, any applicable quote, the Privacy Policy, any cancellation policy provided during booking, and any written reservation-specific terms, constitute the agreement between the customer and USA Limousine Corporation regarding the applicable transportation service.",
        },
        {
          type: "paragraph",
          text: "If a reservation confirmation, contract, service agreement, or written quote contains terms specifically applicable to a reservation that conflict with these general Terms, the reservation-specific terms will control for that reservation.",
        },
      ],
    },
    {
      id: "contact-information",
      title: "Contact Information",
      blocks: [
        {
          type: "paragraph",
          text: "Questions regarding these Terms & Conditions may be directed to:",
        },
        { type: "contact" },
      ],
    },
  ],
};
