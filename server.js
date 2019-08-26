const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex');

const db = knex ({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'pokemon99',
    database : 'smartbrain'
  }
});

db.select('*').from('users');

const app = express();

app.use(cors())
app.use(bodyParser.json());
app.get('/', (req, res) => {
	res.send(database.users);
})

app.post('/signin', (req, res) => {
	db('hash', 'email').from('login')
		.where('email','=', req.body.email)
		.then(data => {
			console.log(data, req.body);
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			console.log(isValid);
			if (isValid) {
				return db('*').from('users')
				  .where('email', '=', req.body.email)
				  .then(user => {
				  	console.log(user);
				  	res.json(user[0])
				  })
				.catch(err => res.status(400).json('unable to get user'))
			} else {
				res.status(400).json('wrong credits')
			}
		})
		.catch(err => res.status(400).json('wrong credentials'))
	})

app.post('/register', (req,res) => {
	const { email, name, password } = req.body;
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(req.body.password, salt);
	db.transaction(trx => {
		trx.insert({
			hash:  hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
			  .returning('*')
			  .insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
			})

				.then(user => {
					res.json(user[0]);
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	
		.catch(err => res.status(400).json('unable to join'))
	
})

app.get('/profile/:id', (req,res)=>{
	const { id } = req.params;
	db.select('*').from('users').where({id})
		.then(user => {
			if(user.lenght){
				res.json(user[0]);
			} else {
				res.status(404).json('not found')
			}

	})
		.catch(err => res.status(404).json('error getting user'))

})

app.put('/image', (req, res) => {
	const { id } = req.body;
	  db('users').where('id', '=', id)
	  .increment('entries', 1)
	  .returning('entries')
	  .then( entries => {
	  	res.json(entries[0]);
	  })
	  .catch(err => res.status(400).json('unable to get entries'))
  })

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3000, () => console.log('Example app listening on port 3000!'))


// / --> res = this is working
// / signin --> POST = succes/ fail
// / register --> POST = user
// / profile / userId--> GET = user
// / image --> PUT --> user 