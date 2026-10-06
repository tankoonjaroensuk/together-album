---
name: good-code-principles
description: กฎการเขียนโค้ดที่ AI ต้องทำตามทุกครั้ง เพื่อให้โค้ดอ่านง่าย ชื่อ function เข้าใจได้ทันที และวางไฟล์ไม่ซับซ้อน ตาม 5 หลักการ (Readability, Scalability & Flexibility, Testability, DRY, Attention to Detail) ใช้ skill นี้ทุกครั้งที่ต้องเขียนโค้ด สร้างไฟล์โค้ด สร้างโปรเจกต์ เขียนฟังก์ชัน/คลาส/สคริปต์ แก้หรือ refactor โค้ด ไม่ว่าภาษาใด (Python, JavaScript, TypeScript, Java, Go, PHP ฯลฯ) แม้ผู้ใช้จะไม่ได้พูดถึงคำว่า "clean code" หรือ "หลักการ" ก็ตาม Use this skill whenever writing, generating, or refactoring any code, scripts, or project files, in Thai or English.
---

# Good Code Principles

เป้าหมายของ skill นี้มีข้อเดียว: **โค้ดที่ AI เขียนต้องให้คนเปิดมาอ่านแล้วเข้าใจได้ทันที** ทั้งชื่อ function การวางไฟล์ และโครงสร้างโค้ด โดยไม่ต้องถามคนเขียน

ก่อนส่งโค้ดทุกครั้ง ให้ถามตัวเองว่า *"ถ้ามือใหม่ในทีมเปิดโปรเจกต์นี้ครั้งแรก เขาจะหาไฟล์ที่ต้องแก้เจอภายในไม่กี่วินาที และเข้าใจแต่ละ function จากชื่อได้เลยไหม?"* ถ้าไม่ ให้แก้ก่อนส่ง

ความเรียบง่ายสำคัญที่สุด เมื่อกฎข้อใดขัดกัน ให้เลือกทางที่อ่านง่ายกว่าเสมอ

## 1. การตั้งชื่อ — ต้องเข้าใจได้โดยไม่ต้องอ่านโค้ดข้างใน

### ชื่อ function

- ขึ้นต้นด้วยกริยา + สิ่งที่กระทำ: `calculate_total_price`, `send_welcome_email`, `find_user_by_email`
- ชื่อต้องบอกสิ่งที่ function ทำ *ทั้งหมด* ถ้า function ส่งอีเมลด้วยแต่ชื่อบอกแค่ `save_user` แปลว่าชื่อโกหก ให้แยก function หรือเปลี่ยนชื่อ
- ถ้าตั้งชื่อแล้วต้องใช้คำว่า "and" (`validate_and_save_order`) แปลว่าทำหลายอย่างเกินไป ให้แยกเป็นสอง function
- function ที่คืน boolean ขึ้นต้นด้วย `is_`, `has_`, `can_`: `is_expired`, `has_permission`
- ใช้คำศัพท์เดียวกันทั้งโปรเจกต์: ถ้าใช้ `get_` ก็ใช้ `get_` ตลอด อย่าปนกับ `fetch_`, `retrieve_`, `load_` สำหรับความหมายเดียวกัน

| ❌ อย่าใช้ | ✅ ใช้แทน | เหตุผล |
|---|---|---|
| `process(data)` | `apply_member_discount(order)` | "process" ไม่บอกว่าทำอะไร |
| `handle()` | `retry_failed_payment()` | "handle" กว้างเกินไป |
| `calc(a, b)` | `calculate_area(width, height)` | ตัวย่อและชื่อ parameter ไม่มีความหมาย |
| `do_stuff2()` | `export_report_to_csv()` | ไม่ควรมีเลขต่อท้ายชื่อ |
| `check_user(u)` | `is_user_active(user)` | "check" ไม่บอกว่าคืนค่าอะไร |

### ชื่อตัวแปรและคลาส

- ไม่ใช้ตัวย่อ ยกเว้นที่คนทั่วไปรู้จัก (`id`, `url`, `html`) และตัวนับใน loop สั้นๆ (`i`)
- ชื่อบอกหน่วยเมื่อมีหน่วย: `timeout_seconds`, `price_thb`, `width_px`
- collection ใช้พหูพจน์: `users`, `order_items`
- คลาสเป็นคำนาม: `Invoice`, `EmailSender` หลีกเลี่ยงคลาสชื่อ `Manager`, `Handler`, `Processor` ที่ไม่บอกหน้าที่ชัดเจน
- ค่าคงที่ตั้งชื่อแทน magic number: `MAX_LOGIN_ATTEMPTS = 5` ไม่ใช่ `if attempts > 5`

ใช้รูปแบบการตั้งชื่อตาม convention ของภาษา (snake_case ใน Python, camelCase ใน JavaScript/TypeScript/Java, PascalCase สำหรับคลาส) และถ้าโค้ดเดิมของผู้ใช้มีสไตล์อยู่แล้ว ให้ตามสไตล์นั้น ชื่อในโค้ดใช้ภาษาอังกฤษเสมอ

## 2. การวางไฟล์ — ไม่ซับซ้อน หาเจอง่าย

### กฎหลัก

- **เริ่มจากน้อยที่สุด** งานที่เขียนได้ในไฟล์เดียวโดยไม่เกิน ~300 บรรทัด ให้อยู่ไฟล์เดียว อย่าแตกไฟล์เพื่อให้ดูเป็นระบบ
- **หนึ่งไฟล์ หนึ่งเรื่อง** เมื่อแยกไฟล์ ให้แต่ละไฟล์มีหน้าที่ที่อธิบายได้ในหนึ่งประโยค
- **ชื่อไฟล์บอกสิ่งที่อยู่ข้างใน**: `price_calculator.py`, `email_sender.ts` ห้ามใช้ชื่อกว้างๆ อย่าง `utils`, `helpers`, `common`, `misc`, `stuff`, `new`, `temp`, `final` เพราะจะกลายเป็นที่ทิ้งโค้ดทุกอย่าง
- **จัดกลุ่มตามฟีเจอร์ ไม่ใช่ตามประเภทไฟล์** เมื่อโปรเจกต์ใหญ่พอจะมีโฟลเดอร์: ไฟล์ที่เกี่ยวกับ "order" อยู่ด้วยกัน ดีกว่ากระจาย model/service/controller ของ order ไปคนละโฟลเดอร์
- **ลึกไม่เกิน 3 ชั้น** นับจาก root ของ source code (เช่น `src/orders/order_service.py`) ถ้าต้องลึกกว่านี้ให้ทบทวนโครงสร้างใหม่
- ไม่สร้างโฟลเดอร์ที่มีไฟล์เดียว เว้นแต่มีเหตุผลชัดเจน (เช่น framework บังคับ)
- ถ้าใช้ framework ที่มีโครงสร้างมาตรฐาน (Next.js, Django, Laravel, Spring ฯลฯ) ให้ทำตามโครงสร้างของ framework นั้น อย่าคิดโครงสร้างใหม่

### ตัวอย่างขนาดโปรเจกต์

สคริปต์เล็ก (งานเดียว):
```
resize_images.py
```

โปรเจกต์ขนาดกลาง:
```
shop/
├── main.py              # จุดเริ่มโปรแกรม
├── config.py            # ค่าตั้งค่าทั้งหมด
├── orders/
│   ├── order_service.py # สร้าง/ยกเลิก order
│   └── price_calculator.py
├── payments/
│   └── payment_gateway.py
└── tests/
    ├── test_order_service.py
    └── test_price_calculator.py
```

❌ แบบที่ไม่ควรทำ:
```
src/app/core/modules/shared/utils/helpers/common.py
```

### เมื่อสร้างหลายไฟล์ ให้แสดงโครงสร้างก่อน

เมื่อเขียนโค้ดตั้งแต่ 2 ไฟล์ขึ้นไป ให้แสดง tree ของไฟล์ทั้งหมดพร้อมคำอธิบายหนึ่งบรรทัดต่อไฟล์ (เหมือนตัวอย่างข้างบน) ก่อนเนื้อหาโค้ด เพื่อให้ผู้ใช้เห็นภาพรวมทันที

## 3. โครงสร้างโค้ดภายในไฟล์

- **function สั้นและทำเรื่องเดียว** โดยทั่วไปไม่เกิน ~30 บรรทัด ถ้ายาวกว่านั้นให้ดูว่าแยกขั้นตอนย่อยเป็น function ที่มีชื่อได้ไหม
- **อ่านจากบนลงล่างได้เหมือนเรื่องเล่า** function หลัก (public) อยู่บน function ย่อยที่มันเรียกอยู่ถัดลงมา
- **ใช้ early return แทน if ซ้อนลึก** ไม่ซ้อนเกิน 3 ชั้น
- **parameter ไม่เกิน 3-4 ตัว** ถ้าเกิน ให้รวมเป็น object/dataclass ที่มีชื่อ
- **ไม่ใช้ boolean flag เปลี่ยนพฤติกรรม function** (`send_email(user, is_reminder=True)`) ให้แยกเป็น `send_welcome_email` กับ `send_reminder_email`
- **เรียบง่ายชนะฉลาด** one-liner ที่ต้องอ่านสามรอบ ให้แตกเป็นหลายบรรทัดพร้อมตัวแปรที่มีชื่อ

## 4. หลักการอื่นที่ต้องรักษา

**Flexibility — ยืดหยุ่นเท่าที่จำเป็น** แยกค่าที่เปลี่ยนบ่อย (config, อัตรา, URL) ไว้ที่เดียว เมื่อมีหลายกรณีคล้ายกันให้ใช้ dict/mapping แทน if/elif ยาวๆ แต่ **ห้ามสร้าง abstraction, base class, factory หรือ design pattern สำหรับความต้องการที่ยังไม่มีจริง** โค้ดที่ยืดหยุ่นเกินเหตุอ่านยากกว่าโค้ดตรงไปตรงมาเสมอ

**Testability — ทดสอบได้** แยก logic (รับ input คืน output) ออกจากส่วนที่ติดต่อโลกภายนอก (ไฟล์, database, API, เวลาปัจจุบัน) ถ้า logic ไม่ trivial ให้เขียน test ตัวอย่างที่ครอบคลุมกรณีปกติและ edge case อย่างน้อยหนึ่งกรณี ไฟล์ test ตั้งชื่อตามไฟล์ที่ทดสอบ (`test_price_calculator.py`)

**DRY — ไม่ซ้ำ แต่ไม่ฝืน** logic เดียวกันที่ซ้ำ 3 ที่ขึ้นไปให้ดึงเป็น function แต่โค้ดที่หน้าตาคล้ายกันแต่มีเหตุผลเปลี่ยนต่างกัน ปล่อยซ้ำได้ ดีกว่ารวมเป็น function เดียวที่มี flag หลายตัว

**Attention to Detail — ใส่ใจรายละเอียด**
- comment อธิบาย *ทำไม* ไม่ใช่ *ทำอะไร* ถ้าต้องเขียน comment อธิบายว่าโค้ดทำอะไร แปลว่าชื่อยังไม่ดีพอ ให้แก้ชื่อแทน
- docstring สั้นๆ สำหรับ function ที่ถูกเรียกจากไฟล์อื่น
- ใส่ type hints/types เมื่อภาษารองรับ
- จัดการ error ให้ชัด: ไม่กลืน exception เงียบๆ (`except: pass`) และข้อความ error บอกว่าเกิดอะไรขึ้น
- คิดถึง edge case: ค่าว่าง/None, list ว่าง, หารด้วยศูนย์, ตัวเลขติดลบ, ข้อความภาษาไทย (encoding UTF-8)

## 5. Checklist ก่อนส่งโค้ด

ตรวจทุกข้อก่อนส่ง แก้ข้อที่ไม่ผ่านโดยไม่ต้องรายงานให้ผู้ใช้ทราบ:

- [ ] อ่านชื่อ function ทุกตัวแล้วรู้ว่ามันทำอะไรโดยไม่ต้องเปิดดูข้างใน
- [ ] ไม่มีชื่อไฟล์/function/ตัวแปรที่กว้างเกินไป (`utils`, `data`, `process`, `handle`, `temp`) หรือเป็นตัวย่อที่ไม่เป็นที่รู้จัก
- [ ] จำนวนไฟล์น้อยที่สุดที่สมเหตุสมผล และแต่ละไฟล์อธิบายหน้าที่ได้ในหนึ่งประโยค
- [ ] ไม่มี function ยาวเกินไป ไม่มี if ซ้อนลึกเกิน 3 ชั้น
- [ ] ไม่มี magic number ไม่มีโค้ดซ้ำที่ควรรวม
- [ ] ไม่มี abstraction ที่ไม่มีใครใช้จริง
- [ ] ตามสไตล์ของโค้ดเดิม (ถ้ามี)

## รูปแบบการตอบ

1. ถ้ามีหลายไฟล์: แสดง tree โครงสร้างไฟล์พร้อมคำอธิบายสั้นๆ
2. โค้ด
3. test ตัวอย่าง (ถ้า logic ไม่ trivial)
4. อธิบายสั้นๆ 2-4 ประโยคถึงการตัดสินใจสำคัญ ไม่ต้องไล่ว่าผ่านหลักการข้อไหนบ้าง

ถ้าผู้ใช้ขอให้รีวิวโค้ดที่มีอยู่ ให้ใช้กฎเดียวกันนี้ตรวจ บอกปัญหาเรียงจากผลกระทบมากไปน้อย (bug ก่อน แล้วค่อยเรื่องชื่อและโครงสร้าง) พร้อมตัวอย่างการแก้ไข

## ตัวอย่าง: ก่อนและหลัง

❌ ก่อน:
```python
def f(d):
    t = 0
    for i in d:
        if i['type'] == 'A':
            t = t + i['price'] * 0.9
        elif i['type'] == 'B':
            t = t + i['price'] * 0.8
        else:
            t = t + i['price']
    return t
```

✅ หลัง:
```python
DISCOUNT_RATES = {"A": 0.10, "B": 0.20}


def calculate_total_price(items: list[dict]) -> float:
    """Return the total price after applying the discount for each item type."""
    return sum(calculate_discounted_price(item) for item in items)


def calculate_discounted_price(item: dict) -> float:
    discount = DISCOUNT_RATES.get(item["type"], 0.0)
    return item["price"] * (1 - discount)
```

สิ่งที่เปลี่ยน: ชื่อ `f`, `d`, `t` กลายเป็นชื่อที่บอกหน้าที่, อัตราส่วนลดย้ายไปอยู่ที่เดียวทำให้เพิ่มประเภทใหม่ได้โดยไม่แก้ function และไม่ได้สร้างคลาส `DiscountStrategy` เพราะ dict เดียวก็พอกับขนาดของปัญหา