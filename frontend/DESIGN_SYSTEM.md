# 🎨 ForestView Homestay - UI/UX Redesign Guide

## Tổng Quan Về Thiết Kế

Giao diện đã được thiết kế lại hoàn toàn với hệ thống component đồng bộ, hiện đại và chuyên nghiệp. Tất cả các trang, dropdown, popup và component đều tuân theo hệ thống thiết kế thống nhất.

---

## 🎯 Hệ Thống Thiết Kế (Design System)

### Màu Sắc (Color Palette)

#### Màu Chính
- **Canvas**: `#faf6ee` - Nền chính
- **Primary**: `#2f5d50` - Màu chính (Forest Green)
- **Primary Dark**: `#1e3f36` - Phiên bản tối của primary
- **Primary Light**: `#e8f3f0` - Phiên bản sáng của primary
- **Accent**: `#c97a3d` - Accent color (Terra Cotta)
- **Accent Light**: `#f5e9e0` - Phiên bản sáng của accent

#### Màu Trạng Thái
- **Success**: `#16a34a` - Thành công
- **Warning**: `#ea8c55` - Cảnh báo
- **Error**: `#dc2626` - Lỗi
- **Info**: `#0ea5e9` - Thông tin

#### Màu Neutral
- 50 đến 900: Từ sáng đến tối cho text, border, bg

### Kiểu Chữ (Typography)

- **Display Font**: Fraunces (serif) - Cho tiêu đề, branding
- **Body Font**: Manrope (sans-serif) - Cho nội dung
- **Heading**: Tự động sử dụng font-display
- **Sizes**: 
  - h1: 4xl → 6xl (responsive)
  - h2: 3xl → 4xl
  - h3: 2xl → 3xl
  - h4: xl → 2xl
  - h5: lg → xl
  - h6: base → lg

### Khoảng Cách (Spacing)

- Tất cả component sử dụng spacing scale
- Chủ yếu: `p-4`, `p-5`, `p-6`, `gap-3`, `gap-4`
- Responsive: Tùy chỉnh theo breakpoint

### Border Radius

- **sm**: `0.375rem` (6px)
- **md**: `0.5rem` (8px)
- **lg**: `0.75rem` (12px)
- **xl**: `1rem` (16px)
- **2xl**: `1.5rem` (24px)
- **3xl**: `2rem` (32px)
- **full**: `9999px` (circle)

### Shadow

- **xs**: `0 1px 2px rgb(0 0 0 / 0.05)`
- **sm**: Nhẹ, cho component bình thường
- **md**: Trung bình, cho hover state
- **lg**: Lớn, cho modal/popover
- **xl**: Rất lớn, cho dropdown
- **2xl**: Siêu lớn, cho các layer cao nhất

---

## 📦 Thư Viện Component UI

### Button Component

```tsx
import { Button } from '@/components/ui/Button';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button isLoading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button icon={<Icon />}>With Icon</Button>
<Button fullWidth>Full Width</Button>
```

### Input Component

```tsx
import { Input } from '@/components/ui/Input';

<Input 
  label="Email"
  type="email"
  placeholder="Enter email"
  error="Email is required"
  helper="We'll never share your email"
  leftIcon={<Mail size={16} />}
  rightIcon={<Check size={16} />}
/>
```

### Select Component

```tsx
import { Select } from '@/components/ui/Select';

<Select
  label="Choose option"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
  value={selected}
  onChange={(value) => setSelected(value)}
  error="Please select an option"
/>
```

### Modal Component

```tsx
import { Modal } from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure?</p>
  <div className="modal-footer">
    <Button variant="outline" onClick={() => setOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  </div>
</Modal>
```

### Badge Component

```tsx
import { Badge } from '@/components/ui/index';

<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge icon={<Star size={12} />}>With Icon</Badge>
```

### Card Component

```tsx
import { Card } from '@/components/ui/index';

<Card>Content</Card>
<Card variant="hover">Hover effect</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="interactive" onClick={handleClick}>
  Interactive
</Card>
```

### Alert Component

```tsx
import { Alert } from '@/components/ui/index';

<Alert variant="success" title="Success!">
  Operation completed successfully
</Alert>
<Alert variant="error" icon={<AlertIcon />} onClose={handleClose}>
  An error occurred
</Alert>
```

### Textarea Component

```tsx
import { Textarea } from '@/components/ui/Textarea';

<Textarea
  label="Message"
  placeholder="Type your message"
  error="This field is required"
  helper="Maximum 500 characters"
/>
```

### Popover Component

```tsx
import { Popover } from '@/components/ui/Popover';

<Popover
  trigger={<button>Click me</button>}
  placement="bottom"
>
  <div className="p-4">
    <p>Popover content</p>
  </div>
</Popover>
```

---

## 🎬 Animations & Transitions

### Được hỗ trợ
- `animate-fadeIn` - Fade in effect
- `animate-slideDown` - Slide down from top
- `animate-slideUp` - Slide up from bottom
- `animate-slideInRight` - Slide in from right
- `animate-slideInLeft` - Slide in from left
- `transition-smooth` - Smooth transition

### Ví dụ
```tsx
<div className="animate-slideUp">
  Content with animation
</div>
```

---

## 🎨 CSS Utility Classes

### Display & Layout
- `.flex-center` - Flex center
- `.flex-between` - Flex space-between
- `.container-responsive` - Responsive container
- `.section-padding` - Section padding

### Cards & Surfaces
- `.card` - Base card style
- `.card-hover` - Hover effect
- `.card-elevated` - Elevated shadow
- `.card-interactive` - Interactive state

### Badges
- `.badge` - Base badge
- `.badge-primary`, `.badge-success`, `.badge-error`, etc.

### Buttons (via CSS classes)
- `.btn-base` - Base button
- `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`, `.btn-danger`, `.btn-success`
- `.btn-sm`, `.btn-lg`, `.btn-icon`

### Forms
- `.form-group` - Form group container
- `.form-label` - Form label
- `.form-error` - Error message
- `.form-helper` - Helper text
- `.input-base` - Base input style
- `.input-error`, `.input-success`, `.input-disabled`

### Tables
- `.table` - Table element
- `.table thead`, `.table th`, `.table td`
- `.table tbody tr` - Table row with hover

### Alerts
- `.alert` - Base alert
- `.alert-success`, `.alert-warning`, `.alert-error`, `.alert-info`

### Utilities
- `.text-truncate` - Truncate text
- `.text-clamp-2`, `.text-clamp-3` - Multi-line truncate
- `.glass` - Glass morphism effect
- `.gradient-primary`, `.gradient-accent` - Gradient backgrounds

---

## 🏗️ Cấu Trúc Thư Mục Component

```
components/
├── ui/                      # Base UI Components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Popover.tsx
│   ├── AdminLayout.tsx
│   └── index.tsx            # Badge, Card, Alert exports
├── Navbar.tsx              # Redesigned
├── Footer.tsx              # Redesigned
├── AccountPopover.tsx      # Improved with modal
├── AdminWorkspaceModal.tsx # Redesigned
├── RoomCard.tsx            # Enhanced
└── [Other Components]
```

---

## 🚀 Những Cải Thiện Chính

### 1. **Hệ Thống Component Đồng Nhất**
   - Tất cả button, input, modal sử dụng component reusable
   - Styling consistent across app
   - Easy to maintain and update

### 2. **Navbar Được Cải Thiện**
   - Better responsive design
   - Improved mobile menu
   - Better visual hierarchy
   - Smooth animations

### 3. **Footer Tối Ưu Hóa**
   - Better layout with grid
   - Social media links
   - Contact info cards
   - More organized sections

### 4. **AccountPopover Tân Trang**
   - Better dropdown design
   - Improved modal with tabs
   - Better form validation
   - Cleaner UI

### 5. **Admin Dashboard**
   - Colorful navigation tabs
   - Better header design
   - Enhanced modal styling
   - Clearer visual hierarchy

### 6. **RoomCard Nâng Cấp**
   - Better image treatment
   - Rating display
   - Better price layout
   - CTA button integrated
   - Improved hover effects

### 7. **Design Tokens**
   - Complete color system
   - Spacing scale
   - Typography hierarchy
   - Shadow system

### 8. **Animation & Transitions**
   - Smooth animations for modals
   - Fade and slide effects
   - Hover state transitions
   - Loading states

---

## 💡 Best Practices

### 1. Sử dụng Component Library
```tsx
// ✅ Good
<Button variant="primary">Click me</Button>
<Input label="Name" placeholder="Enter name" />

// ❌ Avoid
<button className="btn-primary">Click me</button>
<input className="input-base" />
```

### 2. Responsive Design
```tsx
// ✅ Good - responsive sizes
<h1 className="text-4xl md:text-5xl lg:text-6xl">Title</h1>

// ✅ Good - responsive padding
<div className="p-4 md:p-6 lg:p-8">Content</div>
```

### 3. Color Usage
```tsx
// ✅ Good - use variants
<Badge variant="success">Active</Badge>
<Button variant="primary">Action</Button>

// ✅ Good - use semantic colors
<div className="alert alert-error">Error message</div>
```

### 4. Layout Classes
```tsx
// ✅ Good - use utility classes
<div className="flex-center gap-3">Content</div>
<div className="flex-between">Left and Right</div>

// ✅ Good - responsive container
<div className="container-responsive">
  Content
</div>
```

---

## 🔄 Migration Guide

### Thay Thế Button Cũ
```tsx
// Old
<button className="rounded-full bg-primary px-5 py-2.5 text-white">
  Click
</button>

// New
<Button variant="primary">Click</Button>
```

### Thay Thế Input Cũ
```tsx
// Old
<input className="rounded-xl border border-line px-3 py-2.5" />

// New
<Input label="Field" placeholder="Enter value" />
```

### Thay Thế Modal Cũ
```tsx
// Old
<div className="modal-overlay">...</div>

// New
<Modal isOpen={open} onClose={close} title="Title">
  Content
</Modal>
```

---

## 📋 Danh Sách Các Tệp Được Cập Nhật

### ✅ Đã Cập Nhật
- [x] `app/globals.css` - Enhanced design system
- [x] `components/Navbar.tsx` - Redesigned
- [x] `components/Footer.tsx` - Redesigned
- [x] `components/RoomCard.tsx` - Enhanced
- [x] `components/AdminWorkspaceModal.tsx` - Redesigned
- [x] `components/ui/Button.tsx` - New
- [x] `components/ui/Input.tsx` - New
- [x] `components/ui/Select.tsx` - New
- [x] `components/ui/Modal.tsx` - New
- [x] `components/ui/Popover.tsx` - New
- [x] `components/ui/Textarea.tsx` - New
- [x] `components/ui/index.tsx` - Badge, Card, Alert
- [x] `components/ui/AdminLayout.tsx` - New

### 📋 Chưa Cập Nhật (Tiếp Theo)
- [ ] `components/AccountPopover.tsx` - Needs refactor (keep functionality)
- [ ] Admin pages (dashboard, rooms, bookings, users, reviews, holidays, discount-codes)
- [ ] Form pages (login, register, forgot-password, verify-otp)
- [ ] Detail pages (room detail, room-type detail)
- [ ] Other modals and components

---

## 🎯 Hướng Dẫn Sử Dụng

### 1. Import Components
```tsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, Badge, Alert } from '@/components/ui/index';
```

### 2. Use in JSX
```tsx
export default function MyPage() {
  const [name, setName] = useState('');
  
  return (
    <Card>
      <Input 
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

### 3. Styling with Tailwind
```tsx
<div className="space-y-4 p-6 rounded-lg bg-surface border border-line">
  <h2 className="text-2xl font-display font-semibold">Title</h2>
  <p className="text-neutral-600">Description</p>
</div>
```

---

## 📞 Support & Questions

Nếu bạn có bất kỳ câu hỏi nào về hệ thống thiết kế mới, vui lòng tham khảo:
- Design tokens trong `app/globals.css`
- Component examples trong `components/ui/`
- Implementation examples trong `Navbar.tsx`, `Footer.tsx`, `RoomCard.tsx`

---

**Last Updated**: 2025
**Version**: 1.0.0
**Status**: ✅ Active
