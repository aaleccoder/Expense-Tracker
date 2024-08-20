import { Command } from "commander";
import { writeFileSync, readFileSync, existsSync, read, write } from "fs";
// Constants
let data: any[] = [];
const path = "data/data.json"
const program = new Command();

interface Category {
  categoryName: string,
  expenses: Array<Object>
}
interface Expense {
	id: number;
	date: Date;
  description: string,
  amount: number,
}

// Interactivity with CLI
program.command("add-category <category>").action((category) => addCategory(category))
program.command("add-expense <category> <description> <amount>")
			.action((category, description, amount) => addExpense(category, description, amount))
program.command("list <scope>").action((scope) => list(scope))
program.command("delete <category> <id>").action((category, id) => deleteExpense(category, parseInt(id)))
program.command("update <category> <id> <description> <amount>")
	.action((category, id, description, amount) => updateExpense(category, parseInt(id), description, parseFloat(amount)))
program.command("summary").action(() => summary())
program.command("summary-month <month>").action((month) => summaryMonth(parseInt(month)))
program.command("export-csv").action(() => exportCSV())

// Export csv

function exportCSV() {
 	readFile();
	let allData: string = ""


	allData += "Date,Category,Description,Amount\n"
	data.forEach((category) => {
		category.expenses.forEach((expense:any) => {
			allData += `"${expense.date.toISOString().split("T")[0]}","${category.categoryName}","${expense.description}",${expense.amount}\n`
		})
	})

	writeFileSync("export.csv", allData);
}


function summary () {
	readFile();
	let amount: number = 0;
	data.forEach((category) => {
		category.expenses.forEach((expense: any) => amount += parseInt(expense.amount))
	})

	console.log(`Summary: ${amount}$`)
}

function summaryMonth(month: number) {
	readFile();
	if (month < 0 || month > 11) {
		console.log("Invalid month")
		return;
	}
	let amount: number = 0;
	data.forEach((category) => {
		category.expenses.forEach((expense: any) => {
			if(expense.date.getMonth() == month - 1) {
				amount += parseInt(expense.amount);
			}
		})
	})

	console.log(`Summary: ${amount}$`);
}

// CRUD

// Add new category
function addCategory(category: string) {
	readFile();
	let categoryExists = findCategory(category)
	if(categoryExists == null) {
		let newCategory: Category = {categoryName: category, expenses: []}
		data.push(newCategory);
	} else {
		console.log("Category already exists")
	}
  saveFile();
}

// Add new expense
function addExpense(category: string, description: string, amount: number){
	readFile()
	if(amount > 0) {
		console.log("Incorrect amount")
		return;
	}
	let categoryFound = findCategory(category);
	let newExpense: Expense = {id: categoryFound.expenses.length + 1,date: new Date, description: description, amount: amount}

	if (categoryFound != null) {
		categoryFound.expenses.push(newExpense);
	} else {
		console.log("Category not found")
	}
	saveFile();
}

// Deletes expense
function deleteExpense(category: string, id: number){
	readFile();
	let categoryFound = findCategory(category);
	let index = categoryFound.expenses.findIndex((expense: any) => expense.id == id);

	if (categoryFound == null || index == -1) {
		console.log("Category not found")
		return;
	}
	categoryFound.expenses.splice(index, 1);
	saveFile();
}

// Updates expense
function updateExpense(category: string, id: number, description: string, amount: number) {
	readFile();
	let categoryFound = findCategory(category);
	let expense: Expense = categoryFound.expenses.find((expense: any) => expense.id === id)

	if (categoryFound == null || expense == null) {
		console.log("Category not found")
		return;
	}
	if(amount > 0) {
		console.log("Incorrect amount")
		return;
	}

	expense.amount = amount;
	expense.description = description;

	saveFile();
}


// List
function list(scope: string) {
	readFile();


	if (scope == "all") {
		console.log("Date Category Description Amount")
		data.forEach((category) => {
			category.expenses.forEach((expense: any) => {
				console.log(`ID: ${expense.id} - Date: ${expense.date.toISOString().split("T")[0]} | Category: ${category.categoryName} | Description: ${expense.description} | Amount: ${expense.amount}$`)
			})
		})
	} else {
		let findCategory = data.find((category) => category.categoryName === scope)
		if (findCategory != null) {
			findCategory.expenses.forEach((expense: Expense) => console.log(`ID: ${expense.id} - Date: ${expense.date.toISOString().split("T")[0]} | Category: ${findCategory.categoryName} | Description: ${expense.description} | Amount: ${expense.amount}$`))
		} else {
			console.log("That category does not exist")
		}
	}
}


// Utilities
function findCategory(category: string) {
	return data.find((e) => e.categoryName === category);
}


// File operations
function saveFile() {
  writeFileSync(path, JSON.stringify(data));
}

function readFile() {
	if (existsSync(path)) {
		data = JSON.parse(readFileSync(path, "utf-8"))
		// Makes the dates functional again
		data.forEach((category) => {
			category.expenses.forEach((expense: any) => {
				expense.date = new Date(expense.date);
			})
		})
	}
}

program.parse();

