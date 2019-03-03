const Mail = require('../services/Mail')

class PurchaseMail {
  get key () {
    return 'PurchaseMail'
  }

  async handle (job, done) {
    const { user, content, ad } = job.data

    await Mail.sendMail({
      from: '"Victor Sales" <mail@mail.com>',
      to: ad.author.email,
      subject: `Solicitação de Compra - ${ad.title}`,
      template: 'purchase',
      context: { user, content, ad }
    })

    return done()
  }
}

module.exports = new PurchaseMail()
