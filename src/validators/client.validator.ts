import { z } from "zod";

export const registerClientSchema = z.object({
  primary: z.object({
    firstName: z.string({
      required_error: "First name is required",
      invalid_type_error: "First name must be a string",
    }).min(1, "First name is required"),
    lastName: z.string({
      required_error: "Last name is required",
      invalid_type_error: "Last name must be a string",
    }).min(1, "Last name is required"),
    email: z.string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    }).email("Please provide a valid email address"),
    phone: z.string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number must be a string",
    }).min(10, "Phone number must be at least 10 digits"),
    password: z.string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    }).min(6, "Password must be at least 6 characters"),
    userCount: z.number({
      required_error: "Number of users is required",
      invalid_type_error: "Number of users must be a number",
    }).min(1, "User count must be at least 1")
      .max(1000, "User count cannot exceed 1000"),
  }),
  location: z.object({
    locationCode: z.string({
      required_error: "Location code is required",
      invalid_type_error: "Location code must be a string",
    }).min(1, "Location code is required")
      .max(5, "Location code cannot be more than 5 characters")
      .regex(/^[a-zA-Z0-9]+$/, "Only letters and numbers are allowed without spaces"),
    locationName: z.string({
      required_error: "Location name is required",
      invalid_type_error: "Location name must be a string",
    }).min(1, "Location name is required"),
    address: z.string({
      required_error: "Address is required",
      invalid_type_error: "Address must be a string",
    }).min(1, "Address is required"),
    contactName: z.string({
      required_error: "Contact name is required",
      invalid_type_error: "Contact name must be a string",
    }).min(1, "Contact name is required"),
    contactNumber: z.string({
      required_error: "Contact number is required",
      invalid_type_error: "Contact number must be a string",
    }).length(10, "Contact number must be exactly 10 digits"),
    contactMail: z.string({
      required_error: "Contact email is required",
      invalid_type_error: "Contact email must be a string",
    }).email("Please provide a valid email address"),
    lat: z.number({
      required_error: "Latitude is required",
      invalid_type_error: "Latitude must be a number",
    }),
    long: z.number({
      required_error: "Longitude is required",
      invalid_type_error: "Longitude must be a number",
    }),
  }),
  company: z.object({
    companyName: z.string({
      required_error: "Company name is required",
      invalid_type_error: "Company name must be a string",
    }).min(1, "Company name is required"),
    companyAddress: z.string({
      required_error: "Company address is required",
      invalid_type_error: "Company address must be a string",
    }).min(1, "Company address is required"),
    country: z.string({
      required_error: "Country is required",
      invalid_type_error: "Country must be a string",
    }).min(1, "Country is required"),
    zipCode: z.string({
      required_error: "Zip code is required",
      invalid_type_error: "Zip code must be a string",
    }).min(1, "Zip code is required")
      .regex(/^\d+$/, "Zip code must contain only numbers"),
    state: z.string({
      required_error: "State is required",
      invalid_type_error: "State must be a string",
    }).min(1, "State is required"),
    city: z.string({
      required_error: "City is required",
      invalid_type_error: "City must be a string",
    }).min(1, "City is required"),
    contactPersonName: z.string({
      required_error: "Contact person name is required",
      invalid_type_error: "Contact person name must be a string",
    }).min(1, "Contact person name is required"),
    contactMobile: z.string({
      required_error: "Contact mobile is required",
      invalid_type_error: "Contact mobile must be a string",
    }).min(10, "Mobile number must be exactly 10 digits")
      .max(10, "Mobile number must be exactly 10 digits")
      .regex(/^\d+$/, "Contact mobile must contain only numbers"),
    email: z.string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    }).email("Please provide a valid email address"),
  }),
});

export type RegisterClientInput = z.infer<typeof registerClientSchema>;
