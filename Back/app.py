from datetime import datetime
import json
from flask import Flask, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# -------------------------------------------------------------------------------
#CREATING A DATA BASE, CORS FOR OPTION TO CALL SERVER,  AND MINIMAL FLSK APP
app = Flask(__name__)
CORS(app)
 
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.sqlite3'
app.config['SECRET_KEY'] = "random string"
 
db = SQLAlchemy(app)
 # -------------------------------------------------------------------------------
# model Books
class Books(db.Model):
    id = db.Column("book_id", db.Integer, primary_key = True)
    book_Name = db.Column(db.String(100))
    author = db.Column(db.String(50))
    year_Published = db.Column(db.Integer)
    book_Type = db.Column(db.Integer)
    books = db.relationship('Loans', backref='books')
    

 
    def __init__(self, book_Name,author, year_Published, book_Type ):
        self.book_Name = book_Name
        self.author =author
        self.year_Published = year_Published
        self.book_Type = book_Type


        
        


# model Customers
class Customers(db.Model):
    id = db.Column("customer_id",db.Integer, primary_key = True)
    customerName = db.Column(db.String(100))
    city = db.Column(db.String(50))
    age = db.Column(db.Integer)
    customers = db.relationship('Loans', backref='customers')

 
    def __init__(self, customerName, city, age ):
        self.customerName = customerName
        self.city = city
        self.age = age


# model Loans
class Loans(db.Model):
    id = db.Column('loan_id', db.Integer, primary_key = True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.customer_id'))
    book_id = db.Column(db.Integer, db.ForeignKey('books.book_id'))
    loan_Date = db.Column(db.String)
    return_Date = db.Column(db.String)
 
    def __init__(self,customer_id , book_id , loan_Date, return_Date = None):
        self.customer_id = customer_id
        self.book_id = book_id
        self.loan_Date = loan_Date
        self.return_Date = return_Date
# -------------------------------------------------------------------------------
# BOOKS CRUD
@app.route('/library/books', methods = ['GET', 'POST','DELETE'])
@app.route('/library/books/<id>', methods = ['GET', 'POST','DELETE','PUT'])
def crude_books(id=-1):
    if request.method == 'GET':
            res=[]
            for book in Books.query.all():
                res.append({"book_Name":book.book_Name,"author":book.author,"id":book.id,"year_Published":book.year_Published,"book_Type":book.book_Type})
            return  (json.dumps(res))
    if request.method == 'POST':
        request_data = request.get_json()
        book_Name = request_data['book_Name']
        author = request_data['author']
        year_Published= request_data["year_Published"]
        book_Type= request_data["book_Type"]
        new_Book= Books(book_Name,author,year_Published,book_Type)
        db.session.add (new_Book)
        db.session.commit()
        return "a new book was added"
    if request.method == 'DELETE': 
        me=Books.query.get(id)
        db.session.delete(me)
        db.session.commit()
        return {"msg":"book deleted"}
    if request.method == 'PUT':
        me=Books.query.get(id)
        request_data = request.get_json()
        me.book_Name = request_data['book_Name']
        me.author = request_data['author']
        me.year_Published= request_data["year_Published"]
        me.book_Type= request_data["book_Type"]
        db.session.commit()
        return {"msg":"book info updated"}
# -------------------------------------------------------------------------------
# CUSTOMERS CRUD
@app.route('/library/customers', methods = ['GET', 'POST','DELETE'])
@app.route('/library/customers/<id>', methods = ['GET', 'POST','DELETE','PUT'])
def crude_customers(id=-1):
    if request.method == 'GET':
            res=[]
            for customer in Customers.query.all():
                res.append({"customerName":customer.customerName,"city":customer.city,"id":customer.id,"age":customer.age})
            return  (json.dumps(res))
    if request.method == 'POST':
        request_data = request.get_json()
        customerName = request_data['customerName']
        city = request_data['city']
        age= request_data['age']
        new_Customer= Customers(customerName,city,age)
        db.session.add (new_Customer)
        db.session.commit()
        return "a new Customer was added"
    if request.method == 'DELETE': 
        me=Customers.query.get(id)
        db.session.delete(me)
        db.session.commit()
        return "customer deleted"
    if request.method == 'PUT':
        me=Customers.query.get(id)
        request_data = request.get_json()
        me.customerName = request_data['customerName']
        me.city = request_data['city']
        me.age= request_data["age"]
        db.session.commit()
        return "customer info updated"
# -------------------------------------------------------------------------------
# LOANS CRUD
@app.route('/library/loans', methods = ['GET', 'POST','DELETE'])
@app.route('/library/loans/<id>', methods = ['GET', 'POST','DELETE','PUT'])
def crude_loans(id=-1):
    if request.method == 'GET':
            res=[]
            for loan,book in db.session.query(Loans,Books).join(Books).all():
                res.append({"id":loan.id,"customer_id":loan.customer_id,"book_id":loan.book_id,"loan_Date":str(loan.loan_Date),"return_Date":str(loan.return_Date),"book_Type":book.book_Type})
            return  (json.dumps(res))
    if request.method == 'POST':
        request_data = request.get_json()
        customer_id = request_data['customer_id']
        book_id = request_data['book_id']
        loan_Date= request_data["loan_Date"]
        new_Loan= Loans(customer_id,book_id,loan_Date)
        db.session.add (new_Loan)
        db.session.commit()
        return "a new loan was added"
    if request.method == 'DELETE': 
        me=Loans.query.get(id)
        db.session.delete(me)
        db.session.commit()
        return "loan deleted"
    if request.method == 'PUT':
     updLoan = Loans.query.filter_by(id = id).first()
     tmpLoan = request.get_json()
     updLoan.return_Date = tmpLoan["return_Date"]
     db.session.commit()
     return "Book successfully returned"
# -------------------------------------------------------------------------------
# TEST
@app.route('/')
def hello():
    return 'Hello, World!'
 # -------------------------------------------------------------------------------
#  ENTRYPOINT
if __name__ == '__main__':
    with app.app_context():db.create_all()
    app.run(debug = True)
