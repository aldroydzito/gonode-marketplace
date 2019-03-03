const Ad = require('../models/Ad')
const User = require('../models/User')
const Purchase = require('../models/Purchase')

const Queue = require('../services/Queue')
const PurchaseMail = require('../jobs/PurchaseMail')

class PurchaseController {
  async store (req, res) {
    const { ad, content } = req.body

    const purchaseAd = await Ad.findById(ad).populate('author')
    const user = await User.findById(req.userId)

    Queue.create(PurchaseMail.key, {
      ad: purchaseAd,
      user,
      content
    }).save()

    await Purchase.create({ ad: purchaseAd.id, customer: req.userId })

    return res.send()
  }

  async accept (req, res) {
    const { purchase } = req.body
    const purchaseAd = await Purchase.findById(purchase).populate('ad')

    if (purchaseAd.ad.author.toString() !== req.userId) {
      return res.status(400).json({ error: 'Insufficient permissions.' })
    }

    if (purchaseAd.ad.purchasedBy) {
      return res
        .status(400)
        .json({ error: 'This ad has been purchased already.' })
    }

    const accepted = await Ad.findByIdAndUpdate(
      purchaseAd.ad.id,
      {
        purchasedBy: purchaseAd.customer
      },
      { new: true }
    )

    return res.json(accepted)
  }
}

module.exports = new PurchaseController()
