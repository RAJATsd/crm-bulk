const { Contact } = require("../models/contact");

class ContactProcessor {
  async create(phoneNumber, fields) {
    const existingContact = await Contact.findOne({
      $or: [{ phoneNumber }, { email: fields.email }],
    });

    if (existingContact) {
      throw new Error("Contact with this phone number or email already exists");
    }

    return await Contact.create({
      phoneNumber,
      ...fields,
    });
  }

  async update(phoneNumber, fields) {
    const contact = await Contact.findOne({ phoneNumber });

    if (!contact) {
      throw new Error("Contact not found");
    }

    return await Contact.findOneAndUpdate(
      { phoneNumber },
      { $set: fields },
      { new: true }
    );
  }

  async delete(phoneNumber) {
    const contact = await Contact.findOne({ phoneNumber });

    if (!contact) {
      throw new Error("Contact not found");
    }

    await Contact.deleteOne({ phoneNumber });
  }
}

module.exports = { ContactProcessor };
