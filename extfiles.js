﻿$engine JScript
$uname extfiles
$dname Внешние файлы
$addin global
$addin stdcommands
$addin stdlib

/* Скрипт для открытия внешних файлов для Снегопата
 * Автор		: Пушин Владимир, vladnet@gmail.com
 * Дата создания: 24.08.2011
 * Описание		: Добавляет окно из которого можно открывать внешние файлы
 */
var мВерсияСкрипта = 1.31

// Зададим путь в профайле
var pflExtFilesOpenOnStart	= "ExtFiles/OpenOnStart"
var pflExtShowExtInName		= "ExtFiles/ShowExtInName"
var pflExtFilesPath			= "ExtFiles/Path"
var pflExtFilesPathBase		= "ExtFiles/PathBase"

// Восстановим настройки
profileRoot.createValue(pflExtFilesOpenOnStart, false, pflSnegopat)
profileRoot.createValue(pflExtShowExtInName, true, pflSnegopat)
profileRoot.createValue(pflExtFilesPath, false, pflSnegopat)
profileRoot.createValue(pflExtFilesPathBase, false, pflBase)

var мОткрыватьПриСтарте = profileRoot.getValue(pflExtFilesOpenOnStart)
var мОтображатьРасширениеФайлаВПредставлении = profileRoot.getValue(pflExtShowExtInName)
var мМассивКаталоговОбщий = profileRoot.getValue(pflExtFilesPath)
var мМассивКаталоговБазы = profileRoot.getValue(pflExtFilesPathBase)

global.connectGlobals(SelfScript)

try{
	мМассивКаталоговОбщий = ValueFromStringInternal(мМассивКаталоговОбщий)
}
catch(e){
	мМассивКаталоговОбщий = v8New("Массив")
}
try{
	мМассивКаталоговБазы = ValueFromStringInternal(мМассивКаталоговБазы)
}
catch(e){
	мМассивКаталоговБазы = v8New("Массив")
}

мФормаСкрипта=null
мФормаНастройки=null

if(мОткрыватьПриСтарте==true)
	macrosОткрытьОкноВнешнихФайлов()

// Макрос для вызова окна
function macrosОткрытьОкноВнешнихФайлов()
{
	var pathToForm = SelfScript.fullPath.replace(/js$/, 'ssf')
	if(!мФормаСкрипта){
		мФормаСкрипта = loadScriptForm(pathToForm, SelfScript.self) // Обработку событий формы привяжем к самому скрипту
		мФормаСкрипта.Заголовок="Внешние файлы "+мВерсияСкрипта
	}
	мФормаСкрипта.Открыть()
}

function КпШапкаНастройки(Элемент)
{
	var pathToForm=SelfScript.fullPath.replace(/.js$/, 'param.ssf')
	мФормаНастройки=loadScriptForm(pathToForm, SelfScript.self) // Обработку событий формы привяжем к самому скрипту
	мФормаНастройки.ОткрытьМодально()
}

function мЗаписатьНастройки()
{
	мМассивКаталоговОбщий=мФормаНастройки.КаталогиОбщие.ВыгрузитьКолонку("ИмяКаталога")
	мМассивКаталоговБазы=мФормаНастройки.КаталогиБазы.ВыгрузитьКолонку("ИмяКаталога")
	мОткрыватьПриСтарте=мФормаНастройки.ОткрыватьФормуПриЗагрузке
	
	profileRoot.setValue(pflExtFilesOpenOnStart, мОткрыватьПриСтарте)
	profileRoot.setValue(pflExtShowExtInName, мОтображатьРасширениеФайлаВПредставлении)
	profileRoot.setValue(pflExtFilesOpenOnStart, мОткрыватьПриСтарте)
	profileRoot.setValue(pflExtFilesPath, ValueToStringInternal(мМассивКаталоговОбщий))
	profileRoot.setValue(pflExtFilesPathBase, ValueToStringInternal(мМассивКаталоговБазы))
	
	мОбновитьФайлы()
}

function мЗагрузитьНастройку(пМассивКаталогов, пТаблицаКаталогов)
{
	for (var лИнд=0; лИнд<пМассивКаталогов.Количество(); лИнд++)
	{
		лСтрокаТз=пТаблицаКаталогов.Добавить()
		лСтрокаТз.ИмяКаталога=пМассивКаталогов.Получить(лИнд)
	}
}

function НастройкиПриОткрытии()
{
	мФормаНастройки.ОткрыватьФормуПриЗагрузке=мОткрыватьПриСтарте
	мФормаНастройки.ОтображатьРасширениеФайлаВПредставлении=мОтображатьРасширениеФайлаВПредставлении
	мЗагрузитьНастройку(мМассивКаталоговОбщий, мФормаНастройки.КаталогиОбщие);
	мЗагрузитьНастройку(мМассивКаталоговБазы, мФормаНастройки.КаталогиБазы);
}

function КпШапкаЗаписатьИЗакрыть(Кнопка)
{
	мЗаписатьНастройки()
	мФормаНастройки.Закрыть()
}

function КпШапкаЗаписать(Кнопка)
{
	мЗаписатьНастройки()
}

function мВыбратьКаталог()
{
	ДиалогОткрытияФайла=v8New("ДиалогВыбораФайла", РежимДиалогаВыбораФайла.ВыборКаталога)
	ДиалогОткрытияФайла.ПолноеИмяФайла = ""
	ДиалогОткрытияФайла.Заголовок = "Выберите каталог"
	if(ДиалогОткрытияФайла.Выбрать()==false) return ""
	return ДиалогОткрытияФайла.Каталог
}

function КаталогиОбщиеИмяКаталогаНачалоВыбора(Элемент, СтандартнаяОбработка)
{
	лКаталог=мВыбратьКаталог()
	if(лКаталог=="") return
	Элемент.val.Значение=лКаталог
}

function КаталогиБазыИмяКаталогаНачалоВыбора(Элемент, СтандартнаяОбработка)
{
	лКаталог=мВыбратьКаталог()
	if(лКаталог=="") return
	Элемент.val.Значение=лКаталог
}

function мДобавитьФайлы(пПуть, пУзел)
{
	var лФайлы=FindFiles(пПуть, '*.*', false)
	for (var лИнд=0; лИнд<лФайлы.Количество(); лИнд++)
	{
		лФайл=лФайлы.Получить(лИнд)
		
		if((лФайл.ЭтоКаталог() == false) && (мФормаСкрипта.Фильтр != ''))
			if(лФайл.ИмяБезРасширения.toLowerCase().search(мФормаСкрипта.Фильтр.toLowerCase()) == -1) continue;
		
		лСтрокаДереваФайлов=пУзел.Строки.Добавить()
		лСтрокаДереваФайлов.ЭтоКаталог=лФайл.ЭтоКаталог()
		лСтрокаДереваФайлов.ИмяФайла=лФайл.ПолноеИмя
		лСтрокаДереваФайлов.ДатаИзменения=лФайл.ПолучитьВремяИзменения()
		
		if(мОтображатьРасширениеФайлаВПредставлении == true)
			лСтрокаДереваФайлов.Имя=лФайл.Имя
		else
			лСтрокаДереваФайлов.Имя=лФайл.ИмяБезРасширения
		
		if(лСтрокаДереваФайлов.ЭтоКаталог == true)
		{
			if(ValueIsFilled(лФайл.Расширение)) лСтрокаДереваФайлов.Имя+=лФайл.Расширение
			мДобавитьФайлы(лФайл.ПолноеИмя, лСтрокаДереваФайлов)
		}
		else
			лСтрокаДереваФайлов.Тип=лФайл.Расширение.substr(1)
	}
}

function ДобавитьКаталоги(пМассивКаталогов)
{
	for (var лИнд=0; лИнд<пМассивКаталогов.Количество(); лИнд++)
	{
		var лКаталог=пМассивКаталогов.Получить(лИнд);
		лСтрокаДереваФайлов=мФормаСкрипта.ДеревоФайлов.Строки.Добавить()
		лСтрокаДереваФайлов.Имя=лКаталог
		
		мДобавитьФайлы(лКаталог, лСтрокаДереваФайлов)
		лСтрокаДереваФайлов.Строки.Сортировать("ЭтоКаталог Убыв, Имя", true)
	}
	мФормаСкрипта.ДеревоФайлов.Строки.Сортировать("ЭтоКаталог Убыв, Имя", true)
}

function мОбновитьФайлы()
{
	мФормаСкрипта.ДеревоФайлов.Строки.Очистить()
	
	ДобавитьКаталоги(мМассивКаталоговОбщий)
	ДобавитьКаталоги(мМассивКаталоговБазы)
	
	for (var лИнд=0; лИнд<мФормаСкрипта.ДеревоФайлов.Строки.Количество(); лИнд++)
	{
		var Str1=мФормаСкрипта.ДеревоФайлов.Строки.Получить(лИнд)
		мФормаСкрипта.ЭлементыФормы.ДеревоФайлов.Развернуть(Str1, мФормаСкрипта.Фильтр != '');
	}
}

function КпШапкаОбновить(Элемент)
{
	мОбновитьФайлы()
}

function ФильтрПриИзменении(Элемент)
{
	мОбновитьФайлы()
}

function ПриОткрытии()
{
	мОбновитьФайлы()
}

function КпШапкаЗакрыть(Элемент)
{
	мФормаСкрипта.Закрыть()
}

function ДеревоФайловПередНачаломИзменения(пЭлемент, пОтказ)
{
	пОтказ.val = true
	лТекСтрока=пЭлемент.val.ТекущаяСтрока
	if(лТекСтрока.ЭтоКаталог) return
	stdlib.openFileIn1C(лТекСтрока.ИмяФайла)
}

function ДеревоФайловПриВыводеСтроки(пЭлемент, пОформлениеСтроки, пДанныеСтроки)
{
	лЯчейкаИмя=пОформлениеСтроки.val.Ячейки.Имя
	лЯчейкаИмя.ОтображатьКартинку=true
	if(ValueIsFilled(пДанныеСтроки.val.Родитель)==false)
		лЯчейкаИмя.Картинка=БиблиотекаКартинок.СоздатьГруппу
	else if(пДанныеСтроки.val.ЭтоКаталог==true)
		лЯчейкаИмя.Картинка=БиблиотекаКартинок.ОткрытьФайл
	else
		лЯчейкаИмя.Картинка=БиблиотекаКартинок.Форма
}