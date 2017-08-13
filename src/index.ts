import createServices from './services';
import createReadModels from './models';
import Crumble from './crumble';
import express = require('express');
import bodyParser = require('body-parser');
import morgan = require('morgan');

var app = express();
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('./public'));

const crumble = new Crumble();

createReadModels(crumble);
createServices(app, crumble);

app.listen(3000, ()=>console.log('listening on port 3000!'));