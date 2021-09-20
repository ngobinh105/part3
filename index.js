require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const Person = require('./models/person')

morgan.token('type', function (req, res) {
  return JSON.stringify(req.body)
})

// middle ware
app.use(express.static('build'))
app.use(express.json())
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :type')
)
let date = new Date()
app.get('/info', async (request, response) => {
  const persons = await Person.find({})
  response.send(`<div><p>Phonebook has info for ${persons.length} people</p>
  <p>${date.toString()}</p></div>`)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((result) => response.json(result))
})

app.get('/api/persons/:id', async (request, response, next) => {
  try {
    const person = await Person.findById(request.params.id)
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', async (request, response) => {
  const body = request.body
  const result = await Person.find({})
  const existed = result.some((p) => p.name === body.name)
  if (!body.name) {
    response.status(400).json({
      error: 'name is missing',
    })
  }
  if (existed) {
    response.status(400).json({
      error: 'name must be unique',
    })
  }
  if (!body.number) {
    response.status(400).json({
      error: 'number is missing',
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => {
      response.status(400).json({ error: error.message })
    })
})
app.put('/api/persons/:id', async (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }
  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      request.params.id,
      person,
      { new: true }
    )
    if (updatedPerson === null) {
      response.status(400).json({
        error: 'person was removed',
      })
    }
    response.json(updatedPerson)
  } catch (error) {
    console.log(error)
  }
})
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
