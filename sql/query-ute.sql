create database library_control_ute;
use library_control_ute;

drop database library_control_ute;

create table users(
	id_user int auto_increment primary key,
	email varchar(255) not null,
    password text not null,
	name varchar(255) not null,
	first_name varchar(255) not null,
	second_name varchar(255) not null,
	status boolean DEFAULT true,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NULL DEFAULT NULL,
	constraint un_name_users unique(name)
);

create table categories(
	id_category int auto_increment primary key,
    name varchar(255) not null,
    status boolean DEFAULT true,
    created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NULL DEFAULT NULL
);

create table books(
	id_book int auto_increment primary key,
    name text not null,
    author1 text not null,
    author2 text not null,
    editorial text not null,
	id_category int not null,
    book_number int not null,
    edition int not null,
    quantity int not null,
    printed_year int not null,
    lenguage varchar(255) null,
    cost float null,
    can_borrow boolean not null,
    notes text null,
    omr boolean not null,
    printed_place text null,
    status boolean DEFAULT true,
    created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NULL DEFAULT NULL,
    constraint fk_id_category_books_categories foreign key(id_category) references categories(id_category)
);

create table loan(
	id_loan int auto_increment primary key,
    id_book int not null,
    id_user int not null,
    id_student int not null,
    date_loan timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    return_date timestamp null,
    constraint fk_id_book_loan foreign key(id_book) references books(id_book),
    constraint fk_id_student_loan foreign key(id_student) references students(id_student),
    constraint fk_id_user_loan foreign key(id_user) references users(id_user)
);


