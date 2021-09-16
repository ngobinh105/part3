const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.static('build'))
app.use(express.json())

morgan.token('type', function (req, res) {
  return JSON.stringify(req.body)
})
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :type')
)

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]
let date = new Date()
const generateId = (max = 10000) => {
  return Math.floor(Math.random() * max)
}
app.get('/info', (request, response) => {
  response.send(`<div><p>Phonebook has info for ${persons.length} people</p>
  <p>${date.toString()}</p></div>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((person) => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((person) => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  const existed = persons.some((person) => person.name === body.name)
  if (!body.name) {
    response.status(400).json([
      {
        error: 'name is missing',
      },
    ])
  }
  if (existed) {
    response.status(400).json([
      {
        error: 'name must be unique',
      },
    ])
  }
  if (!body.number) {
    response.status(400).json([
      {
        error: 'number is missing',
      },
    ])
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)
  response.json(person)
})
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
