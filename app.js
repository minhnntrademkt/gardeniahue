/**
 * DỰ ÁN GARDENIA HUẾ - BỘ TÍNH PHƯƠNG ÁN TÀI CHÍNH & LỊCH TRÌNH THANH TOÁN
 * Xử lý logic tính toán, tương tác UI, định dạng số liệu, không dùng emoji
 */

(function () {
  'use strict';

  // --- TRẠNG THÁI ỨNG DỤNG ---
  const state = {
    selectedUnitId: 1, // Mặc định căn LK01-01
    activePlan: 'progress', // 'progress' | 'loan' | 'compare'
    depositDate: new Date('2026-10-31'), // Mặc định ngày hiện tại hoặc 31/10/2026
    filters: {
      search: '',
      block: 'all',
      type: 'all',
      orientation: 'all',
      budget: 'all'
    }
  };

  // --- HÀM TIỆN ÍCH ĐỊNH DẠNG ---
  function formatVND(num) {
    if (num === null || num === undefined || isNaN(num)) return '0 đ';
    return Math.round(num).toLocaleString('vi-VN') + ' đ';
  }

  function formatBillion(num) {
    if (!num) return '0 tỷ';
    const val = (num / 1000000000).toFixed(3);
    return val.replace('.', ',') + ' tỷ';
  }

  function formatDate(d) {
    if (!d || isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function addDays(startDate, days) {
    const res = new Date(startDate);
    res.setDate(res.getDate() + days);
    return res;
  }

  // --- TÍNH TOÁN DÒNG TIỀN CHI TIẾT ---

  // 1. Phương án Tiến độ 24 tháng (Chiết khấu 18%)
  function calculateProgressSchedule(unit, depositDate) {
    const price = unit.progressPrice; // Đã gồm 10% VAT
    const priceNoVat = price / 1.1; // Giá trước VAT
    const vatRate = 0.10;
    const regFee = Math.round(price * PROJECT_CONFIG.registrationFeeRate); // 0.5% lệ phí trước bạ

    // Đợt 10: 5% (có VAT) + VAT của 5% Đợt 11
    const vatOfPeriod11 = (priceNoVat * 0.05) * vatRate;
    const period10Amount = Math.round((price * 0.05) + vatOfPeriod11);

    // Đợt 11: 5% (không VAT)
    const period11Amount = Math.round(priceNoVat * 0.05);

    // Ngày HĐMB = PĐC + 10 ngày
    const hdmbDate = addDays(depositDate, 10);

    const rows = [
      {
        order: 'Cọc',
        title: 'Ký Phiếu đặt cọc (PĐC)',
        periodNote: 'Ngay khi ký PĐC',
        dueDate: depositDate,
        ratePercent: 'Cọc 100 tr',
        amount: PROJECT_CONFIG.depositDefault,
        note: 'Xác định là ngày đóng đủ 100.000.000 đồng/căn',
        benefit: ''
      },
      {
        order: 'Đợt 1',
        title: 'Ký Hợp đồng mua bán (HĐMB)',
        periodNote: 'Trong vòng 10 ngày từ PĐC',
        dueDate: hdmbDate,
        ratePercent: '15% (có VAT)',
        amount: Math.round((price * 0.15) - PROJECT_CONFIG.depositDefault),
        note: 'Đã khấu trừ 100.000.000 đồng cọc',
        benefit: 'Ký HĐMB chính thức'
      },
      {
        order: 'Đợt 2',
        title: 'Thanh toán đợt 2',
        periodNote: 'Trong vòng 30 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 30),
        ratePercent: '5% (có VAT)',
        amount: Math.round(price * 0.05),
        note: 'Thanh toán đợt 2',
        benefit: ''
      },
      {
        order: 'Đợt 3',
        title: 'Thanh toán đợt 3',
        periodNote: 'Trong vòng 90 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 90),
        ratePercent: '10% (có VAT)',
        amount: Math.round(price * 0.10),
        note: 'Bàn giao quyền sử dụng kinh doanh sớm',
        benefit: 'Thuê nhà 0 đồng trong 18 tháng để kinh doanh/nội thất'
      },
      {
        order: 'Đợt 4',
        title: 'Thanh toán đợt 4',
        periodNote: 'Trong vòng 180 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 180),
        ratePercent: '10% (có VAT)',
        amount: Math.round(price * 0.10),
        note: 'Tiến độ xây dựng và hoàn thiện',
        benefit: ''
      },
      {
        order: 'Đợt 5',
        title: 'Thanh toán đợt 5',
        periodNote: 'Trong vòng 240 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 240),
        ratePercent: '10% (có VAT)',
        amount: Math.round(price * 0.10),
        note: 'Tiến độ xây dựng và hoàn thiện',
        benefit: ''
      },
      {
        order: 'Đợt 6',
        title: 'Thanh toán đợt 6',
        periodNote: 'Trong vòng 300 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 300),
        ratePercent: '10% (có VAT)',
        amount: Math.round(price * 0.10),
        note: 'Tiến độ xây dựng và hoàn thiện',
        benefit: ''
      },
      {
        order: 'Đợt 7',
        title: 'Thanh toán đợt 7',
        periodNote: 'Trong vòng 360 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 360),
        ratePercent: '10% (có VAT)',
        amount: Math.round(price * 0.10),
        note: 'Tròn 12 tháng kể từ HĐMB',
        benefit: ''
      },
      {
        order: 'Đợt 8',
        title: 'Thanh toán đợt 8',
        periodNote: 'Trong vòng 420 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 420),
        ratePercent: '10% (có VAT)',
        amount: Math.round(price * 0.10),
        note: 'Tiến độ xây dựng và hoàn thiện',
        benefit: ''
      },
      {
        order: 'Đợt 9',
        title: 'Thanh toán đợt 9',
        periodNote: 'Trong vòng 480 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 480),
        ratePercent: '10% (có VAT)',
        amount: Math.round(price * 0.10),
        note: 'Tiến độ xây dựng và hoàn thiện',
        benefit: ''
      },
      {
        order: 'Đợt 10',
        title: 'Thanh toán đợt 10',
        periodNote: 'Trong vòng 540 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 540),
        ratePercent: '5% (VAT) + VAT Đợt 11',
        amount: period10Amount,
        note: 'KH thực hiện thủ tục đăng ký biến động GCN QSDĐ',
        benefit: 'Làm thủ tục đăng ký biến động Giấy chứng nhận'
      },
      {
        order: 'Đợt 11',
        title: 'Nhận Giấy chứng nhận QSH Nhà ở',
        periodNote: 'Khi nhận Thông báo nhận GCN QSDĐ',
        dueDate: new Date('2027-02-28'),
        ratePercent: '5% (chưa VAT) + 0,5% LPTB',
        amount: period11Amount,
        note: `Cộng 0,5% LPTB tạm tính: ${formatVND(regFee)}`,
        benefit: 'Bàn giao Giấy chứng nhận quyền sở hữu nhà ở'
      }
    ];

    const initialDueAtContract = Math.round(price * 0.15); // Tổng 15% khi ký HĐMB (đã gồm cọc)
    const initialDueDay30 = Math.round(price * 0.20); // 20% khi đến ngày 30

    return {
      totalPrice: price,
      originalPrice: unit.originalPrice,
      savings: unit.originalPrice - price,
      discountPercent: 18,
      initialDeposit: PROJECT_CONFIG.depositDefault,
      initialStep1: Math.round((price * 0.15) - PROJECT_CONFIG.depositDefault),
      initialDueAtContract,
      initialDueDay30,
      registrationFee: regFee,
      rows
    };
  }

  // 2. Phương án Vay vốn ngân hàng (Chiết khấu 4%, HTLS 0% & Ân hạn gốc 24 tháng)
  function calculateLoanSchedule(unit, depositDate) {
    const price = unit.loanPrice; // Đã gồm 10% VAT
    const priceNoVat = price / 1.1; // Giá trước VAT
    const vatRate = 0.10;
    const regFee = Math.round(price * PROJECT_CONFIG.registrationFeeRate);

    // Đợt 3 ngân hàng giải ngân: 25% (có VAT) + VAT của 5% Đợt 4
    const vatOfPeriod4 = (priceNoVat * 0.05) * vatRate;
    const bankDisbursePeriod3 = Math.round((price * 0.25) + vatOfPeriod4);

    // Đợt 4 ngân hàng giải ngân: 5% (chưa VAT)
    const bankDisbursePeriod4 = Math.round(priceNoVat * 0.05);

    const hdmbDate = addDays(depositDate, 10);

    const rows = [
      {
        order: 'Cọc',
        title: 'Ký Phiếu đặt cọc (PĐC)',
        periodNote: 'Ngay khi ký PĐC',
        dueDate: depositDate,
        ratePercent: 'Cọc 100 tr',
        customerAmount: PROJECT_CONFIG.depositDefault,
        bankAmount: 0,
        note: 'Đóng đủ 100.000.000 đồng/căn',
        benefit: ''
      },
      {
        order: 'Đợt 1',
        title: 'Ký Hợp đồng mua bán (HĐMB)',
        periodNote: 'Trong vòng 10 ngày từ PĐC',
        dueDate: hdmbDate,
        ratePercent: 'KH: 15% (có VAT)',
        customerAmount: Math.round((price * 0.15) - PROJECT_CONFIG.depositDefault),
        bankAmount: 0,
        note: 'Khấu trừ 100.000.000 đồng cọc',
        benefit: 'Ký HĐMB chính thức'
      },
      {
        order: 'Đợt 2',
        title: 'Đợt 2 - Giải ngân lần 1',
        periodNote: 'Trong vòng 30 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 30),
        ratePercent: 'KH: 5% | NH: 40%',
        customerAmount: Math.round(price * 0.05),
        bankAmount: Math.round(price * 0.40),
        note: 'Kích hoạt hỗ trợ lãi suất 0% & ân hạn gốc trong 24 tháng',
        benefit: 'Thuê nhà 0 đồng trong 300 ngày để kinh doanh, decor'
      },
      {
        order: 'Đợt 3',
        title: 'Đợt 3 - Giải ngân lần 2',
        periodNote: 'Trong vòng 240 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 240),
        ratePercent: 'KH: 10% | NH: 25% + VAT',
        customerAmount: Math.round(price * 0.10),
        bankAmount: bankDisbursePeriod3,
        note: 'KH làm thủ tục đăng ký biến động GCN theo thông báo CĐT',
        benefit: 'Thủ tục đăng ký biến động Giấy chứng nhận'
      },
      {
        order: 'Đợt 4',
        title: 'Nhận GCN QSH Nhà ở',
        periodNote: 'Trong vòng 300 ngày từ HĐMB',
        dueDate: addDays(hdmbDate, 300),
        ratePercent: 'KH: 0,5% LPTB | NH: 5%',
        customerAmount: regFee, // 0.5% lệ phí trước bạ
        bankAmount: bankDisbursePeriod4,
        note: `KH nộp 0,5% LPTB: ${formatVND(regFee)} (tạm tính)`,
        benefit: 'Bàn giao Giấy chứng nhận quyền sở hữu nhà ở'
      }
    ];

    const totalCustomerPaid = Math.round(price * 0.30); // 30% vốn tự có
    const totalBankDisbursed = Math.round(price * 0.70); // 70% ngân hàng

    return {
      totalPrice: price,
      originalPrice: unit.originalPrice,
      savings: unit.originalPrice - price,
      discountPercent: 4,
      totalCustomerPaid,
      totalBankDisbursed,
      initialDeposit: PROJECT_CONFIG.depositDefault,
      initialStep1: Math.round((price * 0.15) - PROJECT_CONFIG.depositDefault),
      initialDueAtContract: Math.round(price * 0.15),
      initialDueDay30: Math.round(price * 0.20), // 20% vốn tự có để kích hoạt giải ngân 40%
      registrationFee: regFee,
      interestSupportNote: 'Hỗ trợ lãi suất 0% trong 24 tháng, ân hạn gốc 24 tháng kể từ ngày giải ngân đầu tiên',
      rows
    };
  }

  // --- RENDER GIAO DIỆN ---

  function renderKPIBar(unit) {
    const kpiUnitCode = document.getElementById('kpi-unit-code');
    const kpiUnitSpecs = document.getElementById('kpi-unit-specs');
    const kpiPriceOrig = document.getElementById('kpi-price-orig');
    const kpiUnitPriceOrig = document.getElementById('kpi-unit-price-orig');
    const kpiPriceProgress = document.getElementById('kpi-price-progress');
    const kpiUnitPriceProgress = document.getElementById('kpi-unit-price-progress');
    const kpiPriceLoan = document.getElementById('kpi-price-loan');
    const kpiUnitPriceLoan = document.getElementById('kpi-unit-price-loan');

    if (kpiUnitCode) kpiUnitCode.textContent = unit.code;
    if (kpiUnitSpecs) kpiUnitSpecs.textContent = `${unit.typeLabel} | Đất: ${unit.landArea} m² | Sàn: ${unit.floorArea} m²`;
    if (kpiPriceOrig) kpiPriceOrig.textContent = formatVND(unit.originalPrice);
    if (kpiUnitPriceOrig) kpiUnitPriceOrig.textContent = `Đơn giá sàn: ${formatVND(unit.originalUnitPrice)}/m²`;
    if (kpiPriceProgress) kpiPriceProgress.textContent = formatVND(unit.progressPrice);
    if (kpiUnitPriceProgress) kpiUnitPriceProgress.textContent = `Đơn giá sàn: ${formatVND(unit.progressUnitPrice)}/m²`;
    if (kpiPriceLoan) kpiPriceLoan.textContent = formatVND(unit.loanPrice);
    if (kpiUnitPriceLoan) kpiUnitPriceLoan.textContent = `Đơn giá sàn: ${formatVND(unit.loanUnitPrice)}/m²`;
  }

  function renderUnitDetailCard(unit) {
    const container = document.getElementById('unit-detail-container');
    if (!container) return;

    const discount18Savings = unit.originalPrice - unit.progressPrice;
    const discount4Savings = unit.originalPrice - unit.loanPrice;

    container.innerHTML = `
      <div class="unit-detail-header">
        <div class="unit-detail-title-group">
          <h2>Mã Lô: ${unit.code} - ${unit.typeLabel}</h2>
          <p>${unit.features}</p>
        </div>
        <div class="badge-benefit">Áp dụng chính sách 10 căn đầu tiên</div>
      </div>

      <div class="specs-grid">
        <div class="spec-item">
          <div class="spec-item-label">Kích thước đất</div>
          <div class="spec-item-val">${unit.dimensions} m</div>
        </div>
        <div class="spec-item">
          <div class="spec-item-label">Diện tích đất / Sàn</div>
          <div class="spec-item-val tabular-nums">${unit.landArea} m² / ${unit.floorArea} m²</div>
        </div>
        <div class="spec-item">
          <div class="spec-item-label">Hướng nhà / Số tầng</div>
          <div class="spec-item-val">${unit.orientation} | ${unit.floors} tầng/căn</div>
        </div>
        <div class="spec-item">
          <div class="spec-item-label">Đường quy hoạch (Lộ giới)</div>
          <div class="spec-item-val">${unit.roadWidth}</div>
        </div>
      </div>

      <div class="price-comparison-grid">
        <div class="price-card">
          <div class="price-card-header-flex">
            <span class="price-card-label">Giá niêm yết (Gồm VAT 10%)</span>
          </div>
          <div class="price-card-value tabular-nums">${formatVND(unit.originalPrice)}</div>
          <div class="price-card-sub">Đơn giá sàn: ${formatVND(unit.originalUnitPrice)}/m²</div>
        </div>

        <div class="price-card interactive ${state.activePlan === 'progress' ? 'active-card' : ''}" data-plan="progress" role="button" tabindex="0" title="Bấm để chọn phương án Tiến độ 24 tháng">
          <div class="price-card-header-flex">
            <span class="price-card-label">Giá thanh toán 24 tháng (-18%)</span>
            <span class="card-select-badge ${state.activePlan === 'progress' ? 'badge-selected' : ''}">
              ${state.activePlan === 'progress' ? 'Đang chọn' : 'Bấm chọn'}
            </span>
          </div>
          <div class="price-card-value tabular-nums">${formatVND(unit.progressPrice)}</div>
          <div class="price-card-sub">Tiết kiệm: <strong>${formatVND(discount18Savings)}</strong> (${formatBillion(discount18Savings)})</div>
        </div>

        <div class="price-card interactive ${state.activePlan === 'loan' ? 'active-card' : ''}" data-plan="loan" role="button" tabindex="0" title="Bấm để chọn phương án Vay ngân hàng">
          <div class="price-card-header-flex">
            <span class="price-card-label">Giá phương án vay (-4%)</span>
            <span class="card-select-badge ${state.activePlan === 'loan' ? 'badge-selected' : ''}">
              ${state.activePlan === 'loan' ? 'Đang chọn' : 'Bấm chọn'}
            </span>
          </div>
          <div class="price-card-value tabular-nums">${formatVND(unit.loanPrice)}</div>
          <div class="price-card-sub">Tiết kiệm: <strong>${formatVND(discount4Savings)}</strong> (HTLS 0% 24 tháng)</div>
        </div>
      </div>
    `;

    // Gắn sự kiện click chọn phương án trực tiếp từ thẻ giá
    container.querySelectorAll('.price-card.interactive').forEach(card => {
      card.addEventListener('click', function () {
        const plan = this.getAttribute('data-plan');
        if (plan) switchPlan(plan);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const plan = this.getAttribute('data-plan');
          if (plan) switchPlan(plan);
        }
      });
    });
  }

  // Danh mục tham chiếu toàn bộ phân khu và khoảng giá
  const ALL_BLOCKS = [
    { code: 'LK01', desc: 'Shophouse' },
    { code: 'LK02', desc: 'Liền kề' },
    { code: 'LK03', desc: 'Liền kề' },
    { code: 'LK04', desc: 'LK & SH' },
    { code: 'LK05', desc: 'LK & SH' },
    { code: 'LK06', desc: 'Liền kề' },
    { code: 'LK12', desc: 'LK & SH' },
    { code: 'LK14', desc: 'Shophouse' },
    { code: 'LK15', desc: 'Liền kề' },
    { code: 'LK16', desc: 'Liền kề' }
  ];

  const BUDGET_TIERS = [
    { key: 'under-8b', label: 'Dưới 8 tỷ', match: p => p < 8000000000 },
    { key: '8b-12b', label: 'Từ 8 đến 12 tỷ', match: p => p >= 8000000000 && p <= 12000000000 },
    { key: '12b-16b', label: 'Từ 12 đến 16 tỷ', match: p => p > 12000000000 && p <= 16000000000 },
    { key: 'over-16b', label: 'Trên 16 tỷ', match: p => p > 16000000000 }
  ];

  // Kiểm tra 1 căn có thỏa mãn điều kiện khoảng giá không
  function matchesBudget(unit, budgetFilter) {
    if (budgetFilter === 'all') return true;
    const tier = BUDGET_TIERS.find(b => b.key === budgetFilter);
    return tier ? tier.match(unit.originalPrice) : true;
  }

  // Cập nhật động bộ lọc phân cấp 3 tầng (Cascading Funnel), tự động ẩn các tùy chọn 0 căn
  function renderDynamicDropdownOptions() {
    const typeSelect = document.getElementById('filter-type');
    const blockSelect = document.getElementById('filter-block');
    const budgetSelect = document.getElementById('filter-budget');
    if (!typeSelect || !blockSelect || !budgetSelect) return;

    // --- TẦNG 1: LOẠI HÌNH SẢN PHẨM ---
    const totalSH = GARDENIA_PRODUCTS.filter(u => u.type === 'SH').length;
    const totalLK = GARDENIA_PRODUCTS.filter(u => u.type === 'LK').length;
    typeSelect.innerHTML = `
      <option value="all">Tất cả loại hình (${GARDENIA_PRODUCTS.length} căn)</option>
      <option value="SH">Shophouse (${totalSH} căn)</option>
      <option value="LK">Liền kề (${totalLK} căn)</option>
    `;
    typeSelect.value = state.filters.type;

    // --- TẦNG 2: PHÂN KHU / DÃY LIỀN KỀ (PHỤ THUỘC LOẠI HÌNH) ---
    // Lấy các sản phẩm thuộc Loại hình đang chọn
    const unitsOfType = state.filters.type === 'all'
      ? GARDENIA_PRODUCTS
      : GARDENIA_PRODUCTS.filter(u => u.type === state.filters.type);

    // Lọc ra các phân khu có sản phẩm (> 0 căn), ẩn hoàn toàn các phân khu 0 căn
    const availableBlocks = ALL_BLOCKS.filter(b => unitsOfType.some(u => u.block === b.code));

    // Nếu phân khu đang chọn không còn nằm trong danh sách khả dụng -> tự động chuyển về 'all'
    if (state.filters.block !== 'all' && !availableBlocks.some(b => b.code === state.filters.block)) {
      state.filters.block = 'all';
    }

    blockSelect.innerHTML = `
      <option value="all">Tất cả phân khu (${unitsOfType.length} căn)</option>
      ${availableBlocks.map(b => {
        const count = unitsOfType.filter(u => u.block === b.code).length;
        return `<option value="${b.code}">${b.code} (${count} căn - ${b.desc})</option>`;
      }).join('')}
    `;
    blockSelect.value = state.filters.block;

    // --- TẦNG 3: KHOẢNG GIÁ NIÊM YẾT (PHỤ THUỘC LOẠI HÌNH & PHÂN KHU) ---
    // Lấy các sản phẩm thỏa mãn cả Loại hình và Phân khu đang chọn
    const unitsInScope = unitsOfType.filter(u => {
      if (state.filters.block !== 'all' && u.block !== state.filters.block) return false;
      return true;
    });

    // Lọc ra các khoảng giá có sản phẩm (> 0 căn), ẩn hoàn toàn các khoảng giá 0 căn
    const availableBudgets = BUDGET_TIERS.filter(bg => unitsInScope.some(u => bg.match(u.originalPrice)));

    // Nếu khoảng giá đang chọn không còn nằm trong danh sách khả dụng -> tự động chuyển về 'all'
    if (state.filters.budget !== 'all' && !availableBudgets.some(bg => bg.key === state.filters.budget)) {
      state.filters.budget = 'all';
    }

    budgetSelect.innerHTML = `
      <option value="all">Tất cả mức giá (${unitsInScope.length} căn)</option>
      ${availableBudgets.map(bg => {
        const count = unitsInScope.filter(u => bg.match(u.originalPrice)).length;
        return `<option value="${bg.key}">${bg.label} (${count} căn)</option>`;
      }).join('')}
    `;
    budgetSelect.value = state.filters.budget;
  }

  // Thẻ tags hiển thị bộ lọc đang áp dụng kèm nút xóa nhanh từng tiêu chí
  function renderActiveFilterTags() {
    const container = document.getElementById('active-filter-chips');
    if (!container) return;

    const chips = [];

    if (state.filters.search) {
      chips.push({ key: 'search', label: `Tìm: "${state.filters.search}"` });
    }
    if (state.filters.type !== 'all') {
      chips.push({ key: 'type', label: state.filters.type === 'SH' ? 'Loại: Shophouse' : 'Loại: Liền kề' });
    }
    if (state.filters.block !== 'all') {
      chips.push({ key: 'block', label: `Phân khu: ${state.filters.block}` });
    }
    if (state.filters.budget !== 'all') {
      const budgetTier = BUDGET_TIERS.find(b => b.key === state.filters.budget);
      chips.push({ key: 'budget', label: budgetTier ? `Giá: ${budgetTier.label}` : 'Khoảng giá' });
    }

    if (chips.length === 0) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = 'flex';
    container.innerHTML = `
      ${chips.map(c => `
        <span class="filter-chip" data-filter-key="${c.key}" role="button" tabindex="0" title="Bấm để bỏ tiêu chí này">
          <span>${c.label}</span>
          <span class="filter-chip-remove">&times;</span>
        </span>
      `).join('')}
      <button type="button" class="filter-chip-clear-all" id="btn-clear-all-chips">Xóa tất cả</button>
    `;

    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        const key = this.getAttribute('data-filter-key');
        removeSingleFilter(key);
      });
      chip.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const key = this.getAttribute('data-filter-key');
          removeSingleFilter(key);
        }
      });
    });

    const clearAllBtn = document.getElementById('btn-clear-all-chips');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function () {
        const resetBtn = document.getElementById('btn-reset-filter');
        if (resetBtn) resetBtn.click();
      });
    }
  }

  function removeSingleFilter(key) {
    if (key === 'search') {
      state.filters.search = '';
      const el = document.getElementById('search-input');
      if (el) el.value = '';
    } else if (key === 'type') {
      state.filters.type = 'all';
    } else if (key === 'block') {
      state.filters.block = 'all';
    } else if (key === 'budget') {
      state.filters.budget = 'all';
    }
    renderDynamicDropdownOptions();
    renderActiveFilterTags();
    renderUnitList();
  }

  function renderUnitList() {
    const listContainer = document.getElementById('unit-list-items');
    const countBadge = document.getElementById('unit-filtered-count');
    if (!listContainer) return;

    const filtered = GARDENIA_PRODUCTS.filter(unit => {
      // Tìm kiếm text
      if (state.filters.search) {
        const q = state.filters.search.toLowerCase().trim();
        const matchCode = unit.code.toLowerCase().includes(q);
        const matchFeatures = unit.features.toLowerCase().includes(q);
        const matchRoad = unit.roadWidth.toLowerCase().includes(q);
        if (!matchCode && !matchFeatures && !matchRoad) return false;
      }

      // Phân khu Block
      if (state.filters.block !== 'all' && unit.block !== state.filters.block) {
        return false;
      }

      // Loại hình
      if (state.filters.type !== 'all' && unit.type !== state.filters.type) {
        return false;
      }

      // Hướng
      if (state.filters.orientation !== 'all' && !unit.orientation.toLowerCase().includes(state.filters.orientation.toLowerCase())) {
        return false;
      }

      // Khoảng giá niêm yết
      if (!matchesBudget(unit, state.filters.budget)) {
        return false;
      }

      return true;
    });

    if (countBadge) countBadge.textContent = `${filtered.length} / 75`;

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <div class="empty-state-title">Không tìm thấy căn phù hợp</div>
          <p class="empty-state-desc">Điều kiện lọc hiện tại chưa có sản phẩm tương ứng trong bảng hàng.</p>
          <button id="btn-empty-reset" class="btn btn-primary btn-sm" type="button" style="margin-top: 6px;">
            Xem toàn bộ 75 căn
          </button>
        </div>
      `;
      const btnEmptyReset = document.getElementById('btn-empty-reset');
      if (btnEmptyReset) {
        btnEmptyReset.addEventListener('click', function () {
          const resetBtn = document.getElementById('btn-reset-filter');
          if (resetBtn) resetBtn.click();
        });
      }
      return;
    }

    // Tự động đồng bộ hiển thị sang căn đầu tiên trong danh sách lọc nếu căn cũ không thuộc kết quả lọc
    const isCurrentInFiltered = filtered.some(u => u.stt === state.selectedUnitId);
    if (!isCurrentInFiltered && filtered.length > 0) {
      state.selectedUnitId = filtered[0].stt;
      const newUnit = filtered[0];
      renderUnitDetailCard(newUnit);
      renderFinancialBreakdown(newUnit);
    }

    listContainer.innerHTML = filtered.map(u => {
      const isSelected = u.stt === state.selectedUnitId;
      const tagClass = u.type === 'SH' ? 'unit-tag-sh' : 'unit-tag-lk';
      const displayPrice = state.activePlan === 'loan' ? u.loanPrice : u.progressPrice;

      return `
        <div class="unit-card ${isSelected ? 'active' : ''}" data-id="${u.stt}">
          <div class="unit-card-header">
            <span class="unit-code">${u.code}</span>
            <span class="unit-tag ${tagClass}">${u.typeLabel}</span>
          </div>
          <div class="unit-specs">
            Đất: ${u.landArea} m² | Hướng: ${u.orientation}
          </div>
          <div class="unit-price-row tabular-nums">
            <span class="unit-price-orig">${formatBillion(u.originalPrice)}</span>
            <span class="unit-price-discount">${formatVND(displayPrice)}</span>
          </div>
        </div>
      `;
    }).join('');

    // Gắn sự kiện click chọn căn
    listContainer.querySelectorAll('.unit-card').forEach(card => {
      card.addEventListener('click', function () {
        const id = parseInt(this.getAttribute('data-id'), 10);
        selectUnit(id);
      });
    });
  }

  function renderFinancialBreakdown(unit) {
    const container = document.getElementById('financial-breakdown-container');
    if (!container) return;

    if (state.activePlan === 'progress') {
      const data = calculateProgressSchedule(unit, state.depositDate);

      container.innerHTML = `
        <div class="initial-capital-section">
          <div class="section-header-row">
            <h3 class="section-title">1. Chi phí Vốn tự có cần chuẩn bị ban đầu (Phương án Tiến độ)</h3>
            <div class="date-picker-inline">
              <label for="deposit-date-input">Ngày ký PĐC dự kiến:</label>
              <input type="date" id="deposit-date-input" class="date-input" value="${state.depositDate.toISOString().split('T')[0]}" />
            </div>
          </div>

          <div class="initial-steps-grid">
            <div class="step-card">
              <div class="step-badge">Bước 1: Ngay khi ký PĐC</div>
              <div class="step-amount tabular-nums">${formatVND(data.initialDeposit)}</div>
              <div class="step-notes">Ký Phiếu đặt cọc và đóng đủ 100 triệu đồng/căn. Ngày: ${formatDate(state.depositDate)}.</div>
            </div>

            <div class="step-card primary">
              <div class="step-badge">Bước 2: Trong vòng 10 ngày (Ký HĐMB)</div>
              <div class="step-amount tabular-nums">${formatVND(data.initialStep1)}</div>
              <div class="step-notes">15% Giá bán có VAT (${formatVND(data.initialDueAtContract)}) trừ 100 triệu đã cọc.</div>
            </div>

            <div class="step-card">
              <div class="step-badge">Bước 3: Trong 30 ngày từ HĐMB</div>
              <div class="step-amount tabular-nums">${formatVND(Math.round(data.totalPrice * 0.05))}</div>
              <div class="step-notes">Đóng tiếp 5% Giá bán. Tổng lũy kế đạt 20% giá bán sau 30 ngày.</div>
            </div>
          </div>

          <div class="initial-summary-banner">
            <span>Tổng vốn tự có cần có để hoàn tất ký Hợp đồng mua bán (15%): <strong class="tabular-nums">${formatVND(data.initialDueAtContract)}</strong></span>
            <span>Tổng giá bán sau chiết khấu 18%: <strong class="tabular-nums">${formatVND(data.totalPrice)}</strong></span>
          </div>
        </div>

        <div class="schedule-section">
          <div class="section-header-row">
            <h3 class="section-title">2. Lịch trình thanh toán 11 Đợt theo Tiến độ 24 tháng (Chiết khấu 18%)</h3>
            <span class="counter-badge">Đầy đủ 11 đợt thanh toán chuẩn</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="text-center" style="width: 60px;">Đợt</th>
                  <th>Thời hạn quy định</th>
                  <th>Ngày dự kiến</th>
                  <th class="text-center">Tỷ lệ %</th>
                  <th class="text-right">Số tiền thanh toán (VNĐ)</th>
                  <th>Quyền lợi & Nội dung</th>
                </tr>
              </thead>
              <tbody>
                ${data.rows.map((r, idx) => `
                  <tr class="${idx === 1 || idx === 3 || idx === 11 ? 'highlight-row' : ''}">
                    <td class="text-center font-bold">${r.order}</td>
                    <td>${r.periodNote}</td>
                    <td class="tabular-nums">${formatDate(r.dueDate)}</td>
                    <td class="text-center tabular-nums">${r.ratePercent}</td>
                    <td class="text-right tabular-nums font-bold">${formatVND(r.amount)}</td>
                    <td>
                      <div>${r.note}</div>
                      ${r.benefit ? `<div class="badge-benefit">${r.benefit}</div>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right">TỔNG CỘNG TIỀN NHÀ VÀ ĐẤT (ĐÃ GỒM VAT 10%):</td>
                  <td class="text-right tabular-nums font-bold" style="color: var(--color-primary); font-size: 15px;">${formatVND(data.totalPrice)}</td>
                  <td>Tiết kiệm 18%: ${formatVND(data.savings)} so với giá niêm yết</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 10px; line-height: 1.5;">
            * Ghi chú: Đợt 11 có thêm khoản 0,5% lệ phí trước bạ theo quy định pháp luật để nhận GCN QSH nhà ở (tạm tính theo giá bán: ${formatVND(data.registrationFee)}). Thời gian CĐT hoàn thành cập nhật Giấy chứng nhận quyền sở hữu nhà là ngày 28/02/2027 (hoàn thành công tác cập nhật sổ nhà tháng 3/2027).
          </div>
        </div>
      `;
    } else if (state.activePlan === 'loan') {
      const data = calculateLoanSchedule(unit, state.depositDate);

      container.innerHTML = `
        <div class="initial-capital-section">
          <div class="section-header-row">
            <h3 class="section-title">1. Chi phí Vốn tự có cần chuẩn bị (Phương án Vay Ngân hàng 70%)</h3>
            <div class="date-picker-inline">
              <label for="deposit-date-input">Ngày ký PĐC dự kiến:</label>
              <input type="date" id="deposit-date-input" class="date-input" value="${state.depositDate.toISOString().split('T')[0]}" />
            </div>
          </div>

          <div class="initial-steps-grid">
            <div class="step-card">
              <div class="step-badge">Bước 1: Ngay khi ký PĐC</div>
              <div class="step-amount tabular-nums">${formatVND(data.initialDeposit)}</div>
              <div class="step-notes">Khách hàng đặt cọc 100 triệu đồng. Ngày: ${formatDate(state.depositDate)}.</div>
            </div>

            <div class="step-card gold">
              <div class="step-badge">Bước 2: Trong 10 ngày (Ký HĐMB)</div>
              <div class="step-amount tabular-nums">${formatVND(data.initialStep1)}</div>
              <div class="step-notes">15% Giá bán có VAT (${formatVND(data.initialDueAtContract)}) trừ 100 triệu cọc.</div>
            </div>

            <div class="step-card primary">
              <div class="step-badge">Bước 3: Trong 30 ngày (Đợt 2)</div>
              <div class="step-amount tabular-nums">${formatVND(Math.round(data.totalPrice * 0.05))}</div>
              <div class="step-notes">Đóng 5%. Ngân hàng giải ngân 40%. Nhận nhà thuê 0 đồng 300 ngày.</div>
            </div>
          </div>

          <div class="initial-summary-banner">
            <span>Tổng vốn tự có Khách hàng chuẩn bị (30%): <strong class="tabular-nums">${formatVND(data.totalCustomerPaid)}</strong></span>
            <span>Ngân hàng giải ngân (70%): <strong class="tabular-nums">${formatVND(data.totalBankDisbursed)}</strong> (HTLS 0% 24 tháng)</span>
          </div>
        </div>

        <div class="schedule-section">
          <div class="section-header-row">
            <h3 class="section-title">2. Lịch trình Thanh toán & Giải ngân Ngân hàng (Chiết khấu 4%)</h3>
            <span class="badge-bank">Hỗ trợ lãi suất 0% & Ân hạn nợ gốc 24 tháng</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="text-center" style="width: 50px;">Đợt</th>
                  <th>Thời hạn quy định</th>
                  <th>Ngày dự kiến</th>
                  <th class="text-center">Tỷ lệ %</th>
                  <th class="text-right">Khách hàng thanh toán</th>
                  <th class="text-right">Ngân hàng giải ngân</th>
                  <th>Quyền lợi & Nội dung</th>
                </tr>
              </thead>
              <tbody>
                ${data.rows.map((r, idx) => `
                  <tr class="${idx === 2 || idx === 4 ? 'highlight-row' : ''}">
                    <td class="text-center font-bold">${r.order}</td>
                    <td>${r.periodNote}</td>
                    <td class="tabular-nums">${formatDate(r.dueDate)}</td>
                    <td class="text-center tabular-nums">${r.ratePercent}</td>
                    <td class="text-right tabular-nums font-bold" style="color: var(--color-primary);">${formatVND(r.customerAmount)}</td>
                    <td class="text-right tabular-nums font-bold" style="color: var(--color-accent-blue);">${r.bankAmount > 0 ? formatVND(r.bankAmount) : '-'}</td>
                    <td>
                      <div>${r.note}</div>
                      ${r.benefit ? `<div class="badge-benefit">${r.benefit}</div>` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right">TỔNG CỘNG:</td>
                  <td class="text-right tabular-nums font-bold" style="color: var(--color-primary);">${formatVND(data.totalCustomerPaid)} (30%)</td>
                  <td class="text-right tabular-nums font-bold" style="color: var(--color-accent-blue);">${formatVND(data.totalBankDisbursed)} (70%)</td>
                  <td>Tổng giá bán (-4%): ${formatVND(data.totalPrice)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 10px; line-height: 1.5;">
            * Lưu ý chính sách vay: Khách hàng được CĐT hỗ trợ lãi suất 0% trong vòng 24 tháng tính từ thời điểm giải ngân lần đầu, ân hạn nợ gốc trong vòng 24 tháng kể từ lần giải ngân đầu tiên. Đợt 4 khách hàng thanh toán thêm 0,5% lệ phí trước bạ theo quy định pháp luật (tạm tính: ${formatVND(data.registrationFee)}).
          </div>
        </div>
      `;
    } else if (state.activePlan === 'compare') {
      const dataProgress = calculateProgressSchedule(unit, state.depositDate);
      const dataLoan = calculateLoanSchedule(unit, state.depositDate);
      const diffTotal = dataLoan.totalPrice - dataProgress.totalPrice;

      container.innerHTML = `
        <div class="initial-capital-section">
          <div class="section-header-row">
            <h3 class="section-title">Bảng đối chiếu song song 2 Phương án Tài chính (Căn: ${unit.code})</h3>
            <span class="counter-badge">So sánh trực diện dòng tiền</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Chỉ số so sánh</th>
                  <th class="text-right" style="width: 250px;">Phương án 1: Tiến độ 24 tháng</th>
                  <th class="text-right" style="width: 250px;">Phương án 2: Vay vốn Ngân hàng</th>
                  <th>Chênh lệch & Đánh giá dòng tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Giá niêm yết (gồm 10% VAT)</strong></td>
                  <td class="text-right tabular-nums font-bold">${formatVND(unit.originalPrice)}</td>
                  <td class="text-right tabular-nums font-bold">${formatVND(unit.originalPrice)}</td>
                  <td>Giá niêm yết CĐT công bố</td>
                </tr>
                <tr class="highlight-row">
                  <td><strong>Tỷ lệ chiết khấu áp dụng</strong></td>
                  <td class="text-right tabular-nums font-bold" style="color: var(--color-primary);">Chiết khấu 18%</td>
                  <td class="text-right tabular-nums font-bold" style="color: var(--color-gold-dark);">Chiết khấu 4%</td>
                  <td>Tiến độ hưởng mức chiết khấu cao nhất (+14%)</td>
                </tr>
                <tr>
                  <td><strong>Giá bán sau chiết khấu</strong></td>
                  <td class="text-right tabular-nums font-bold" style="color: var(--color-primary);">${formatVND(dataProgress.totalPrice)}</td>
                  <td class="text-right tabular-nums font-bold" style="color: var(--color-gold-dark);">${formatVND(dataLoan.totalPrice)}</td>
                  <td>Phương án Tiến độ rẻ hơn: <strong class="tabular-nums">${formatVND(diffTotal)}</strong></td>
                </tr>
                <tr>
                  <td><strong>Số tiền tiết kiệm so với giá niêm yết</strong></td>
                  <td class="text-right tabular-nums">${formatVND(dataProgress.savings)}</td>
                  <td class="text-right tabular-nums">${formatVND(dataLoan.savings)}</td>
                  <td>Lợi thế tài chính lớn khi trả theo tiến độ</td>
                </tr>
                <tr class="highlight-row">
                  <td><strong>Tổng vốn tự có cần có trong 24 tháng</strong></td>
                  <td class="text-right tabular-nums font-bold">${formatVND(dataProgress.totalPrice)} (100%)</td>
                  <td class="text-right tabular-nums font-bold" style="color: var(--color-accent-blue);">${formatVND(dataLoan.totalCustomerPaid)} (30%)</td>
                  <td>Gói vay chỉ cần bỏ ra 30% vốn tự có trong suốt 2 năm đầu</td>
                </tr>
                <tr>
                  <td><strong>Vốn ban đầu khi ký HĐMB (10 ngày)</strong></td>
                  <td class="text-right tabular-nums">${formatVND(dataProgress.initialDueAtContract)} (15%)</td>
                  <td class="text-right tabular-nums">${formatVND(dataLoan.initialDueAtContract)} (15%)</td>
                  <td>Đều chuẩn bị 15% (đã gồm 100 tr cọc)</td>
                </tr>
                <tr>
                  <td><strong>Đặc quyền thuê nhà 0 đồng nhận sớm</strong></td>
                  <td class="text-right">18 tháng (kể từ Đợt 3 - 90 ngày)</td>
                  <td class="text-right">300 ngày (kể từ Đợt 2 - 30 ngày)</td>
                  <td>Nhận nhà sớm để hoàn thiện decor kinh doanh</td>
                </tr>
                <tr>
                  <td><strong>Chính sách lãi suất & Ân hạn nợ gốc</strong></td>
                  <td class="text-right">- (Khách tự cân đối vốn)</td>
                  <td class="text-right" style="color: var(--color-accent-blue); font-weight: 600;">HTLS 0% & Ân hạn gốc 24 tháng</td>
                  <td>Không chịu áp lực trả lãi và gốc ngân hàng trong 2 năm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="background-color: var(--color-bg); padding: 14px 18px; border-radius: var(--radius-md); margin-top: 16px; font-size: 13px; line-height: 1.5;">
            <strong>Tư vấn lựa chọn:</strong><br/>
            - <strong>Chọn Tiến độ 24 tháng</strong> nếu khách hàng có nguồn vốn dồi dào, muốn tối đa hóa lợi nhuận với mức chiết khấu cực cao 18% (tiết kiệm đến ${formatBillion(dataProgress.savings)}).<br/>
            - <strong>Chọn Vay Ngân hàng</strong> nếu khách hàng muốn dùng đòn bẩy tài chính, chỉ bỏ ra 30% vốn tự có (${formatVND(dataLoan.totalCustomerPaid)}), nhận nhà kinh doanh sớm và được CĐT tài trợ toàn bộ lãi suất 0% + ân hạn gốc suốt 24 tháng.
          </div>
        </div>
      `;
    }

    // Gắn sự kiện date input
    const dateInput = document.getElementById('deposit-date-input');
    if (dateInput) {
      dateInput.addEventListener('change', function () {
        const val = this.value;
        if (val) {
          state.depositDate = new Date(val);
          renderFinancialBreakdown(unit);
        }
      });
    }
  }

  function renderPerks() {
    const perksContainer = document.getElementById('perks-grid-container');
    const resortContainer = document.getElementById('resort-amenities-container');

    if (perksContainer) {
      perksContainer.innerHTML = POLICY_PERKS.map(p => `
        <div class="perk-card">
          <div class="perk-card-header">
            <span class="perk-title">${p.title}</span>
            <span class="perk-badge">${p.status}</span>
          </div>
          <div class="perk-desc">${p.desc}</div>
        </div>
      `).join('');
    }

    if (resortContainer) {
      resortContainer.innerHTML = RESORT_AMENITIES.map(a => `
        <li>${a}</li>
      `).join('');
    }
  }

  // --- HÀM TẠO NỘI DUNG SAO CHÉP DÀNH CHO SALES (ZALO/EMAIL) ---
  function generateConsultationSummaryText(unit) {
    const dataProgress = calculateProgressSchedule(unit, state.depositDate);
    const dataLoan = calculateLoanSchedule(unit, state.depositDate);

    const isProgress = state.activePlan === 'progress';
    const isCompare = state.activePlan === 'compare';
    const chosenPlanName = isCompare 
      ? 'ĐỐI CHIẾU SONG SONG 2 PHƯƠNG ÁN (TIẾN ĐỘ & VAY NGÂN HÀNG)'
      : (isProgress ? 'PHƯƠNG ÁN TIẾN ĐỘ 24 THÁNG (CHIẾT KHẤU 18%)' : 'PHƯƠNG ÁN VAY NGÂN HÀNG (CHIẾT KHẤU 4% - HTLS 0% 24 THÁNG)');
    const chosenData = isProgress ? dataProgress : dataLoan;

    let text = `BẢNG TÍNH PHƯƠNG ÁN TÀI CHÍNH - DỰ ÁN GARDENIA HUẾ\n`;
    text += `Áp dụng theo chính sách bán hàng chính thức (22/10/2026 - 30/11/2026)\n`;
    text += `Đơn vị phát triển: IUC Group & Đất Xanh Miền Trung\n`;
    text += `--------------------------------------------------\n\n`;

    text += `THÔNG TIN SẢN PHẨM:\n`;
    text += `- Mã lô: ${unit.code} (${unit.typeLabel})\n`;
    text += `- Vị trí: ${unit.features}\n`;
    text += `- Diện tích đất: ${unit.landArea} m² | Kích thước: ${unit.dimensions} m\n`;
    text += `- Diện tích sàn xây dựng: ${unit.floorArea} m² (${unit.floors} tầng/căn)\n`;
    text += `- Hướng nhà: ${unit.orientation} | Đường quy hoạch: ${unit.roadWidth}\n`;
    text += `- Giá niêm yết (gồm 10% VAT): ${formatVND(unit.originalPrice)} (Đơn giá sàn: ${formatVND(unit.originalUnitPrice)}/m²)\n\n`;

    if (isCompare) {
      text += `PHƯƠNG ÁN: ${chosenPlanName}\n`;
      text += `--------------------------------------------------\n`;
      text += `1. PHƯƠNG ÁN TIẾN ĐỘ 24 THÁNG (CHIẾT KHẤU 18%):\n`;
      text += `- Giá sau chiết khấu: ${formatVND(dataProgress.totalPrice)}\n`;
      text += `- Tiết kiệm: ${formatVND(dataProgress.savings)} so với giá niêm yết\n`;
      text += `- Vốn tự có ký HĐMB (15%): ${formatVND(dataProgress.initialDueAtContract)}\n`;
      text += `- Đặc quyền: Thuê nhà 0 đồng trong 18 tháng để kinh doanh sớm\n\n`;
      text += `2. PHƯƠNG ÁN VAY NGÂN HÀNG (CHIẾT KHẤU 4%):\n`;
      text += `- Giá sau chiết khấu: ${formatVND(dataLoan.totalPrice)}\n`;
      text += `- Tiết kiệm: ${formatVND(dataLoan.savings)} so với giá niêm yết\n`;
      text += `- Vốn tự có khách hàng (30%): ${formatVND(dataLoan.totalCustomerPaid)}\n`;
      text += `- Ngân hàng giải ngân (70%): ${formatVND(dataLoan.totalBankDisbursed)} (Hỗ trợ lãi suất 0% & ân hạn gốc 24 tháng)\n`;
      text += `- Đặc quyền: Thuê nhà 0 đồng trong 300 ngày để kinh doanh sớm\n\n`;
    } else {
      text += `PHƯƠNG ÁN ĐANG CHỌN: ${chosenPlanName}\n`;
      text += `- Giá bán sau chiết khấu: ${formatVND(chosenData.totalPrice)}\n`;
      text += `- Số tiền tiết kiệm so với giá niêm yết: ${formatVND(chosenData.savings)}\n\n`;

      text += `1. CHI PHÍ VỐN TỰ CÓ BAN ĐẦU CẦN CHUẨN BỊ:\n`;
      text += `- Đặt cọc: ${formatVND(PROJECT_CONFIG.depositDefault)} (Ngày: ${formatDate(state.depositDate)})\n`;
      text += `- Đợt 1 ký HĐMB (10 ngày sau PĐC): ${formatVND(chosenData.initialStep1)} (Đã trừ 100 tr cọc)\n`;
      text += `-> Tổng vốn tự có để ký HĐMB (15%): ${formatVND(chosenData.initialDueAtContract)}\n`;
      text += `- Đợt 2 (30 ngày sau HĐMB): ${formatVND(Math.round(chosenData.totalPrice * 0.05))} (5%)\n`;
      text += `-> Tổng tích lũy sau 30 ngày (20%): ${formatVND(chosenData.initialDueDay30)}\n\n`;

      text += `2. LỊCH TRÌNH THANH TOÁN CHI TIẾT:\n`;
      if (isProgress) {
        dataProgress.rows.forEach(r => {
          text += `[${r.order}] ${r.periodNote} (${formatDate(r.dueDate)}): ${formatVND(r.amount)} (${r.ratePercent})\n`;
          if (r.benefit) text += `   * Quyền lợi: ${r.benefit}\n`;
        });
      } else {
        text += `Khách hàng đóng 30% vốn tự có: ${formatVND(dataLoan.totalCustomerPaid)}\n`;
        text += `Ngân hàng giải ngân 70%: ${formatVND(dataLoan.totalBankDisbursed)} (Hỗ trợ LS 0% & ân hạn gốc 24 tháng)\n`;
        dataLoan.rows.forEach(r => {
          text += `[${r.order}] ${r.periodNote} (${formatDate(r.dueDate)}):\n`;
          text += `   - KH đóng: ${formatVND(r.customerAmount)}\n`;
          if (r.bankAmount > 0) text += `   - Ngân hàng giải ngân: ${formatVND(r.bankAmount)}\n`;
          if (r.benefit) text += `   * Quyền lợi: ${r.benefit}\n`;
        });
      }
    }

    text += `\n3. CHÍNH SÁCH QUÀ TẶNG KÈM THEO:\n`;
    text += `- Gói du lịch trị giá 20 triệu đồng (giao dịch trước 30/11/2026)\n`;
    text += `- Gói thi công hoàn thiện mặt ngoài cao cấp (sơn, kính CNC, lan can, đèn chiếu sáng, cây xanh)\n`;
    text += `- Gói cảnh quan sân vườn và cây xanh ban công\n`;
    text += `- Miễn phí vận hành (an ninh, vệ sinh) 03 năm đầu tiên cho 10 căn đầu\n`;
    text += `- Chính sách khai thác dòng tiền 12 tháng không lợi nhuận cùng ĐXMT (sau đó chia sẻ 85/15)\n`;
    text += `- Thời gian CĐT cập nhật Giấy chứng nhận: ngày 28/02/2027 (sổ nhà tháng 3/2027)\n`;

    return text;
  }

  function showToast(msg) {
    const toast = document.getElementById('toast-notice');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  // --- HÀM CHUYỂN ĐỔI PHƯƠNG ÁN THANH TOÁN TẬP TRUNG ---
  function switchPlan(planName) {
    if (!planName) return;
    state.activePlan = planName;

    // 1. Cập nhật các nút tab và trạng thái
    const tabBtns = document.querySelectorAll('.tab-btn[data-plan]');
    tabBtns.forEach(btn => {
      const plan = btn.getAttribute('data-plan');
      const pill = btn.querySelector('.tab-status-pill');
      if (plan === planName) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        if (pill) pill.textContent = 'Đang chọn';
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
        if (pill) pill.textContent = 'Bấm chọn';
      }
    });

    // 2. Lấy căn hiện tại và render lại các component liên quan
    const unit = GARDENIA_PRODUCTS.find(u => u.stt === state.selectedUnitId) || GARDENIA_PRODUCTS[0];
    renderUnitDetailCard(unit);
    renderFinancialBreakdown(unit);
    renderUnitList();
  }

  // --- HÀM CHỌN CĂN ---
  function selectUnit(id) {
    state.selectedUnitId = id;
    const unit = GARDENIA_PRODUCTS.find(u => u.stt === id) || GARDENIA_PRODUCTS[0];

    renderKPIBar(unit);
    renderUnitDetailCard(unit);
    renderFinancialBreakdown(unit);
    renderUnitList();
  }

  // --- KHỞI TẠO SỰ KIỆN ---
  function initEvents() {
    // Tìm kiếm ô input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.filters.search = this.value;
        renderUnitList();
      });
    }

    // Bộ lọc dạng sổ xuống theo phễu phân cấp 3 tầng (Cascading Funnel)
    const typeSelect = document.getElementById('filter-type');
    const blockSelect = document.getElementById('filter-block');
    const budgetSelect = document.getElementById('filter-budget');

    // 1. Tầng 1: Loại hình sản phẩm thay đổi
    if (typeSelect) {
      typeSelect.addEventListener('change', function () {
        state.filters.type = this.value;
        renderDynamicDropdownOptions();
        renderActiveFilterTags();
        renderUnitList();
      });
    }

    // 2. Tầng 2: Phân khu / Dãy liền kề thay đổi
    if (blockSelect) {
      blockSelect.addEventListener('change', function () {
        state.filters.block = this.value;
        renderDynamicDropdownOptions();
        renderActiveFilterTags();
        renderUnitList();
      });
    }

    // 3. Tầng 3: Khoảng giá niêm yết thay đổi
    if (budgetSelect) {
      budgetSelect.addEventListener('change', function () {
        state.filters.budget = this.value;
        renderDynamicDropdownOptions();
        renderActiveFilterTags();
        renderUnitList();
      });
    }

    // 4. Ô tìm kiếm từ khóa
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.filters.search = this.value;
        renderActiveFilterTags();
        renderUnitList();
      });
    }

    // 5. Nút Đặt lại bộ lọc
    const resetBtn = document.getElementById('btn-reset-filter');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.filters.search = '';
        state.filters.type = 'all';
        state.filters.block = 'all';
        state.filters.budget = 'all';

        if (searchInput) searchInput.value = '';
        renderDynamicDropdownOptions();
        renderActiveFilterTags();
        renderUnitList();
      });
    }

    // Chuyển Tab Phương thức thanh toán (Bộ nút chọn phương án)
    const tabBtns = document.querySelectorAll('.tab-btn[data-plan]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const plan = this.getAttribute('data-plan');
        if (plan) switchPlan(plan);
      });
    });

    // Nút Sao chép tóm tắt
    const copyModalBtn = document.getElementById('btn-copy-modal');
    const modalOverlay = document.getElementById('copy-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCloseAction = document.getElementById('modal-close-action');
    const copyDoBtn = document.getElementById('modal-copy-action');
    const copyTextarea = document.getElementById('modal-copy-textarea');

    if (copyModalBtn && modalOverlay && copyTextarea) {
      copyModalBtn.addEventListener('click', function () {
        const unit = GARDENIA_PRODUCTS.find(u => u.stt === state.selectedUnitId) || GARDENIA_PRODUCTS[0];
        copyTextarea.value = generateConsultationSummaryText(unit);
        modalOverlay.classList.add('open');
      });
    }

    if (modalCloseBtn && modalOverlay) {
      modalCloseBtn.addEventListener('click', () => modalOverlay.classList.remove('open'));
    }
    if (modalCloseAction && modalOverlay) {
      modalCloseAction.addEventListener('click', () => modalOverlay.classList.remove('open'));
    }
    if (copyDoBtn && copyTextarea) {
      copyDoBtn.addEventListener('click', function () {
        copyTextarea.select();
        navigator.clipboard.writeText(copyTextarea.value).then(() => {
          showToast('Đã sao chép tóm tắt phương án tài chính thành công!');
          modalOverlay.classList.remove('open');
        }).catch(() => {
          document.execCommand('copy');
          showToast('Đã sao chép vào bộ nhớ tạm.');
          modalOverlay.classList.remove('open');
        });
      });
    }

    // Nút In ấn
    const printBtn = document.getElementById('btn-print');
    if (printBtn) {
      printBtn.addEventListener('click', function () {
        window.print();
      });
    }
  }

  // Khởi động khi tải xong DOM
  document.addEventListener('DOMContentLoaded', function () {
    const initialUnit = GARDENIA_PRODUCTS[0];
    renderKPIBar(initialUnit);
    renderUnitDetailCard(initialUnit);
    renderDynamicDropdownOptions();
    renderActiveFilterTags();
    renderUnitList();
    renderFinancialBreakdown(initialUnit);
    renderPerks();
    initEvents();
  });

})();

