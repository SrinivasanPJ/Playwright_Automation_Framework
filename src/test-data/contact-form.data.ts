export type ContactFormData = {
  name: string;
  email: string;
  password: string;
  company: string;
  website: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  zipCode: string;
};

export const validContactFormData: ContactFormData = {
  name: 'Srinivasan PJ',
  email: 'srinivasan.pj@example.com',
  password: 'Playwright@101',
  company: 'Playwright Automation',
  website: 'https://example.com',
  country: 'United States',
  city: 'Austin',
  addressLine1: '100 Test Automation Avenue',
  addressLine2: 'Suite 101',
  state: 'Texas',
  zipCode: '78701',
};
