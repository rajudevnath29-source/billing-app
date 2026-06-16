const STATE_CODE_TO_NAME = {
  "01": "jammu and kashmir",
  "02": "himachal pradesh",
  "03": "punjab",
  "04": "chandigarh",
  "05": "uttarakhand",
  "06": "haryana",
  "07": "delhi",
  "08": "rajasthan",
  "09": "uttar pradesh",
  "10": "bihar",
  "11": "sikkim",
  "12": "arunachal pradesh",
  "13": "nagaland",
  "14": "manipur",
  "15": "mizoram",
  "16": "tripura",
  "17": "meghalaya",
  "18": "assam",
  "19": "west bengal",
  "20": "jharkhand",
  "21": "odisha",
  "22": "chhattisgarh",
  "23": "madhya pradesh",
  "24": "gujarat",
  "26": "dadra and nagar haveli and daman and diu",
  "27": "maharashtra",
  "29": "karnataka",
  "30": "goa",
  "31": "lakshadweep",
  "32": "kerala",
  "33": "tamil nadu",
  "34": "puducherry",
  "35": "andaman and nicobar islands",
  "36": "telangana",
  "37": "andhra pradesh",
  "38": "ladakh",
};

function normalizeState(value) {
  return (value || "").trim().toLowerCase();
}

function getStateCodeFromGstin(gstin) {
  const cleaned = (gstin || "").trim().toUpperCase();
  if (cleaned.length >= 2 && /^\d{2}/.test(cleaned)) {
    return cleaned.substring(0, 2);
  }
  return "";
}

function isSameState(gstSettings, partyData) {
  const businessStateCode = (gstSettings?.state_code || "").trim();
  const businessStateName = normalizeState(gstSettings?.state);
  const partyStateName = normalizeState(partyData?.state);
  const partyStateCode = getStateCodeFromGstin(partyData?.gst_number);

  if (businessStateName && partyStateName && businessStateName === partyStateName) {
    return true;
  }

  if (businessStateCode && partyStateCode && businessStateCode === partyStateCode) {
    return true;
  }

  if (businessStateCode && partyStateName) {
    const mappedName = STATE_CODE_TO_NAME[businessStateCode];
    if (mappedName && mappedName === partyStateName) {
      return true;
    }
  }

  if (partyStateCode && businessStateName) {
    const mappedName = STATE_CODE_TO_NAME[partyStateCode];
    if (mappedName && mappedName === businessStateName) {
      return true;
    }
  }

  return false;
}

function canDetermineGstType(gstSettings, partyData) {
  const hasBusinessState = !!(gstSettings?.state_code || gstSettings?.state);
  const hasPartyState = !!(partyData?.state || getStateCodeFromGstin(partyData?.gst_number));
  return hasBusinessState && hasPartyState;
}

function getPlaceOfSupply(partyData) {
  const partyStateName = (partyData?.state || "").trim();
  if (partyStateName) {
    return partyStateName;
  }

  const partyStateCode = getStateCodeFromGstin(partyData?.gst_number);
  if (partyStateCode && STATE_CODE_TO_NAME[partyStateCode]) {
    return STATE_CODE_TO_NAME[partyStateCode]
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return partyStateCode;
}

module.exports = {
  isSameState,
  canDetermineGstType,
  getPlaceOfSupply,
  getStateCodeFromGstin,
};
