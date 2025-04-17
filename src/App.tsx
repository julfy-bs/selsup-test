import { mdiDeleteOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { clsx } from 'clsx';
import {
	ChangeEvent,
	DetailedHTMLProps,
	FormEvent,
	InputHTMLAttributes,
	ReactElement,
	useMemo,
	useState,
} from 'react';
import './App.css';

const parameterTypes: Pick<Param, 'id' | 'name'>[] = [
	{
		id: 0,
		name: 'string',
	},
	{
		id: 1,
		name: 'number',
	},
	{
		id: 2,
		name: 'select',
	},
];

const initialParameters: Param[] = [
	{
		id: 1,
		name: 'Назначение',
		type: 'string',
		value: 'повседневное',
	},
	{
		id: 2,
		name: 'Длина',
		type: 'string',
		value: 'макси',
	},
];

function App(): ReactElement {
	const [params, setParams] = useState<Param[]>(initialParameters);
	
	const addParam = () => {
		setParams([...params, {
			id: params.length + 1,
			name: '',
			type: ParamTypes.string,
			value: '',
		}]);
	};
	
	const deleteParam = (id: number) => {
		setParams(params.filter(param => param.id !== id));
	};
	
	const updateParam = (id: number, value: Partial<Param>) => {
		setParams(
			params.map(param => param.id === id ? { ...param, ...value } : param),
		);
	};
	
	return (
		<>
			<header className={ clsx('header') }>
				<h1>Selsup test assignment</h1>
			</header>
			<main className={ clsx('main') }>
				<ParametersTable
					parameters={ params }
					onAdd={ addParam }
					onUpdate={ updateParam }
					onDelete={ deleteParam }
				/>
			</main>
		</>
	);
}

function ParametersTable({
	parameters,
	onDelete,
	onUpdate,
	onAdd,
}: ParametersTableProps): ReactElement {
	
	const columns = [
		{ key: 'id', name: 'ID' },
		{ key: 'name', name: 'Название' },
		{ key: 'type', name: 'Тип' },
		{ key: 'value', name: 'Значение' },
		{ key: 'delete', name: '' },
	];
	
	const handleSubmitForm = (e: FormEvent<HTMLButtonElement>) => {
		e.preventDefault();
		console.table(parameters);
	};
	
	const rows = useMemo(() => {
		return parameters;
	}, [parameters]);
	
	return (
		<ul className={ clsx('table') }>
			<li className={ clsx('table__row', 'table__row_header') }>
				{
					columns.map((column) => (
						<span
							className={ clsx('table__cell') }
							key={ column.key }
						>{ column.name }</span>
					))
				}
			</li>
			{
				rows.map((row) => (
					<li
						className={ clsx('table__row') }
						key={ row.id }
					>
						<span className={ clsx('table__cell') }>{ row.id }</span>
						<span className={ clsx('table__cell') }>
							<Input
								name={ row.name }
								onChange={ (e) =>
									onUpdate(
										row.id,
										{ name: e.target.value },
									) }
								value={ row.name }
							/>
						</span>
						<span className={ clsx('table__cell') }>
							<select
								name={ 'select' }
								onChange={ (e) => {
									console.log(e.target.value, 'select changed');
									onUpdate(
										row.id,
										{ type: e.target.value as keyof typeof ParamTypes },
									);
								} }
							>
								{
									parameterTypes.map(type => (
										<option
											key={ type.id }
											value={ type.name }
										>{ type.name }</option>
									))
								}
							</select>
						</span>
						<span className={ clsx('table__cell') }>
								<Input
									type={ row.type }
									name={ row.name }
									onChange={ (e) =>
										onUpdate(
											row.id,
											{ value: e.target.value },
										) }
									value={ row.value }
								/>
							</span>
						<span className={ clsx('table__cell') }>
							<button
								className={ clsx('button_type_icon') }
								onClick={ () => onDelete(row.id) }
							>
								<Icon
									path={ mdiDeleteOutline }
									title='Удалить параметр'
									size={ 1 }
									color='currentColor'
								/>
							</button>
						</span>
					</li>
				))
			}
			<li className={ clsx('table__row') }>
				<button onClick={ onAdd }>
					<Icon
						path={ mdiPlus }
						size={ 1 }
					/>
				</button>
				<ExportCSV
					data={ parameters }
					fileName='parameters-list.csv'
				/>
				<button onClick={ handleSubmitForm }>Вывести параметры в консоль
				</button>
			</li>
		</ul>
	);
}

function Input({
	name,
	type = ParamTypes.string,
	onChange,
	value,
	...props
}: InputProps) {
	const [valueInput, setValueInput] = useState(value || '');
	
	const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValueInput(e.target.value);
		onChange?.(e);
	};
	
	return (
		<>
			{
				type === ParamTypes.string ? (
						<label className={ clsx('input') }>
							<input
								className={ clsx('input__element') }
								name={ name }
								value={ valueInput }
								onChange={ onInputChange }
								{ ...props }
							/>
						</label>
					)
					: <span>По ТЗ предусмотрен только тип String</span>
			}
		</>
	
	);
}

const ExportCSV = ({ data, fileName }: ExportCSVProps) => {
	const download = () => {
		const csvString = [
			['ID', 'Название', 'Тип', 'Значение'],
			...data.map(item => [item.id, item.name, item.type, item.value]),
		]
			.map(row => row.join(','))
			.join('\n');
		const blob = new Blob([csvString], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName || 'download.csv';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};
	
	return <button onClick={ download }>Скачать CSV файл</button>;
};

enum ParamTypes {
	string = 'string',
	number = 'number',
	select = 'select'
}

type Param = {
	id: number;
	name: string;
	type: keyof typeof ParamTypes;
	value: string;
}

type ParametersTableProps = {
	parameters: Param[];
	onAdd: () => void;
	onUpdate: (id: number, value: Partial<Param>) => void;
	onDelete: (id: number) => void;
}

type InputProps = {
	name: string;
	value?: string;
	type?: keyof typeof ParamTypes;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

type ExportCSVProps = {
	data: Param[];
	fileName: string;
}

export default App;
