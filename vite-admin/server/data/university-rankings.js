// Comprehensive university rankings database for NIRF and QS scores
// NIRF rankings are from NIRF India Rankings 2024
// QS rankings are from QS World University Rankings 2024

export const UNIVERSITY_RANKINGS = [
  // IITs
  { name: 'Indian Institute of Technology Madras', shortNames: ['iit madras'], nirf: 1, qs: 227 },
  { name: 'Indian Institute of Technology Delhi', shortNames: ['iit delhi'], nirf: 2, qs: 197 },
  { name: 'Indian Institute of Technology Bombay', shortNames: ['iit bombay'], nirf: 3, qs: 149 },
  { name: 'Indian Institute of Technology Kanpur', shortNames: ['iit kanpur'], nirf: 4, qs: 263 },
  { name: 'Indian Institute of Technology Kharagpur', shortNames: ['iit kharagpur'], nirf: 6, qs: 271 },
  { name: 'Indian Institute of Technology Roorkee', shortNames: ['iit roorkee'], nirf: 7, qs: 369 },
  { name: 'Indian Institute of Technology Guwahati', shortNames: ['iit guwahati'], nirf: 8, qs: 384 },
  { name: 'Indian Institute of Technology Hyderabad', shortNames: ['iit hyderabad'], nirf: 9, qs: 441 },
  { name: 'Indian Institute of Technology Indore', shortNames: ['iit indore'], nirf: 11, qs: null },
  { name: 'Indian Institute of Technology (BHU) Varanasi', shortNames: ['iit bhu', 'iit varanasi'], nirf: 12, qs: 601 },
  { name: 'Indian Institute of Technology Gandhinagar', shortNames: ['iit gandhinagar'], nirf: 13, qs: null },
  { name: 'Indian Institute of Technology Ropar', shortNames: ['iit ropar'], nirf: 14, qs: null },
  { name: 'Indian Institute of Technology Bhubaneswar', shortNames: ['iit bhubaneswar'], nirf: 15, qs: null },
  { name: 'Indian Institute of Technology Jodhpur', shortNames: ['iit jodhpur'], nirf: 16, qs: null },
  { name: 'Indian Institute of Technology Patna', shortNames: ['iit patna'], nirf: 20, qs: null },
  { name: 'Indian Institute of Technology Mandi', shortNames: ['iit mandi'], nirf: 41, qs: 1100 },
  { name: 'Indian Institute of Technology (ISM) Dhanbad', shortNames: ['iit ism', 'iit dhanbad'], nirf: 17, qs: null },
  { name: 'Indian Institute of Technology Tirupati', shortNames: ['iit tirupati'], nirf: null, qs: null },
  { name: 'Indian Institute of Technology Palakkad', shortNames: ['iit palakkad'], nirf: null, qs: null },
  { name: 'Indian Institute of Technology Jammu', shortNames: ['iit jammu'], nirf: null, qs: null },
  { name: 'Indian Institute of Technology Goa', shortNames: ['iit goa'], nirf: null, qs: null },
  { name: 'Indian Institute of Technology Bhilai', shortNames: ['iit bhilai'], nirf: null, qs: null },
  { name: 'Indian Institute of Technology Dharwad', shortNames: ['iit dharwad'], nirf: null, qs: null },
  
  // IISc and IISERs
  { name: 'Indian Institute of Science', shortNames: ['iisc', 'iisc bangalore'], nirf: 1, qs: 225 },
  { name: 'Indian Institute of Science Education and Research Pune', shortNames: ['iiser pune'], nirf: 24, qs: null },
  { name: 'Indian Institute of Science Education and Research Kolkata', shortNames: ['iiser kolkata'], nirf: null, qs: null },
  { name: 'Indian Institute of Science Education and Research Mohali', shortNames: ['iiser mohali'], nirf: null, qs: null },
  { name: 'Indian Institute of Science Education and Research Thiruvananthapuram', shortNames: ['iiser trivandrum', 'iiser thiruvananthapuram'], nirf: null, qs: null },
  { name: 'Indian Institute of Science Education and Research Bhopal', shortNames: ['iiser bhopal'], nirf: null, qs: null },
  { name: 'Indian Institute of Science Education and Research Tirupati', shortNames: ['iiser tirupati'], nirf: null, qs: null },
  
  // NITs
  { name: 'National Institute of Technology Tiruchirappalli', shortNames: ['nit trichy', 'nit tiruchirappalli'], nirf: 10, qs: 601 },
  { name: 'National Institute of Technology Karnataka, Surathkal', shortNames: ['nit karnataka', 'nitk', 'nit surathkal'], nirf: 19, qs: 801 },
  { name: 'National Institute of Technology Rourkela', shortNames: ['nit rourkela'], nirf: 21, qs: null },
  { name: 'National Institute of Technology Warangal', shortNames: ['nit warangal'], nirf: 35, qs: null },
  { name: 'National Institute of Technology Calicut', shortNames: ['nit calicut'], nirf: 38, qs: null },
  
  // Central Universities
  { name: 'University of Delhi', shortNames: ['delhi university', 'du'], nirf: 11, qs: 407 },
  { name: 'Jawaharlal Nehru University', shortNames: ['jnu'], nirf: 2, qs: 1220 },
  { name: 'Banaras Hindu University', shortNames: ['bhu'], nirf: 13, qs: 801 },
  { name: 'Aligarh Muslim University', shortNames: ['amu'], nirf: 15, qs: 801 },
  { name: 'University of Hyderabad', shortNames: ['uoh'], nirf: 23, qs: 801 },
  { name: 'Jamia Millia Islamia', shortNames: ['jamia'], nirf: 3, qs: 801 },
  
  // Deemed Universities
  { name: 'Birla Institute of Technology and Science, Pilani', shortNames: ['bits pilani', 'bits'], nirf: 28, qs: 801 },
  { name: 'Manipal Academy of Higher Education', shortNames: ['manipal'], nirf: 15, qs: 801 },
  { name: 'Amity University', shortNames: ['amity'], nirf: 25, qs: 1001 },
  { name: 'VIT University, Vellore', shortNames: ['vit', 'vit vellore'], nirf: 11, qs: 801 },
  { name: 'SRM Institute of Science and Technology', shortNames: ['srm'], nirf: 18, qs: 801 },
  { name: 'Thapar Institute of Engineering and Technology', shortNames: ['thapar'], nirf: 27, qs: null },
  { name: 'KIIT University', shortNames: ['kiit'], nirf: 25, qs: null },
  { name: 'Lovely Professional University', shortNames: ['lpu'], nirf: 39, qs: null },
  { name: 'Shiv Nadar University', shortNames: ['shiv nadar'], nirf: 50, qs: null },
  
  // State Universities
  { name: 'Anna University', shortNames: ['anna university'], nirf: 18, qs: 427 },
  { name: 'Jadavpur University', shortNames: ['jadavpur'], nirf: 12, qs: 801 },
  
  // IIITs
  { name: 'Indian Institute of Information Technology Hyderabad', shortNames: ['iiit hyderabad', 'iiith'], nirf: 55, qs: null },
  { name: 'Indian Institute of Information Technology Allahabad', shortNames: ['iiit allahabad', 'iiita'], nirf: 101, qs: null },
  
  // Private Universities
  { name: 'BML Munjal University', shortNames: ['bml munjal', 'bmu'], nirf: 68, qs: null },
  { name: 'Ashoka University', shortNames: ['ashoka'], nirf: 2, qs: null },
  { name: 'O.P. Jindal Global University', shortNames: ['jindal'], nirf: 50, qs: null },
  { name: 'Christ University', shortNames: ['christ'], nirf: 54, qs: null },
  { name: 'Amrita Vishwa Vidyapeetham', shortNames: ['amrita'], nirf: 7, qs: 801 },
  
  // Specialized Institutions
  { name: 'Delhi Technological University', shortNames: ['dtu'], nirf: 34, qs: null },
  { name: 'Netaji Subhas University of Technology', shortNames: ['nsut', 'nsit'], nirf: 58, qs: null },
  { name: 'Institute of Chemical Technology, Mumbai', shortNames: ['ict', 'ict mumbai'], nirf: 45, qs: null },
];

// Helper function to match university name
export function findUniversityRanking(universityName) {
  if (!universityName) return null;
  
  const uniLower = universityName.toLowerCase().trim();
  
  // Try exact match first
  let match = UNIVERSITY_RANKINGS.find(r => r.name.toLowerCase() === uniLower);
  if (match) return match;
  
  // Try partial match with full name
  match = UNIVERSITY_RANKINGS.find(r => uniLower.includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(uniLower));
  if (match) return match;
  
  // Try matching with short names
  match = UNIVERSITY_RANKINGS.find(r => 
    r.shortNames.some(short => uniLower.includes(short.toLowerCase()))
  );
  
  return match || null;
}
