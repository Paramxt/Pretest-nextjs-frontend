'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackGroudApp from '../../../components/layout';
import { Edit, HeartPlus, Search, Trash, Vote, X } from 'lucide-react';
import dynamic from 'next/dynamic'

interface Quote {
  id: string;
  qoute: string;
  votesPoint?: number;
  userId?: string;
  updatedAt?: {
    seconds: number;
    nanoseconds: number;
  };
}
const QUOTES_PER_PAGE = 5;
const MainPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKey, setSearchKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('updatedAt_desc');
  const [showAddQuoteModal, setShowAddQuoteModal] = useState<boolean>(false);
  const [newQuoteText, setNewQuoteText] = useState<string>('');
  const [showEditQuoteModal, setShowEditQuoteModal] = useState(false);
  const [editQuoteId, setEditQuoteId] = useState<string | null>(null);
  const [editQuoteText, setEditQuoteText] = useState<string>('');
  const [quotesToShow, setQuotesToShow] = useState<number>(QUOTES_PER_PAGE);
  const [filterVotes, setFilterVotes] = useState<string>('all');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteQuoteId, setDeleteQuoteId] = useState<string | null>(null);


  const router = useRouter();

  const fetchAndProcessQuotes = async () => {
    setLoading(true);
    setError(null);

    const access_token = localStorage.getItem('access_token');

    if (!access_token) {
      setError('ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/qoute', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: Quote[] = await response.json();

      let processedData = data;
      if (searchKey.trim()) {
        processedData = processedData.filter(quote =>
          quote.qoute.toLowerCase().includes(searchKey.toLowerCase())
        );
      }

      if (filterVotes === 'zero') {
        processedData = processedData.filter(quote => (quote.votesPoint || 0) === 0);
      } else if (filterVotes === 'greaterThanZero') {
        processedData = processedData.filter(quote => (quote.votesPoint || 0) > 0);
      } else if (filterVotes === 'greaterThanTwo') {
        processedData = processedData.filter(quote => (quote.votesPoint || 0) > 2);
      }

      const getTimestamp = (item: Quote): number => {
        if (!item.updatedAt) return 0;

        if (typeof item.updatedAt === 'object' && item.updatedAt.seconds) {
          return item.updatedAt.seconds * 1000;
        }

        if (typeof item.updatedAt === 'string') {
          return new Date(item.updatedAt).getTime();
        }

        if (item.updatedAt instanceof Date) {
          return item.updatedAt.getTime();
        }

        if (typeof item.updatedAt === 'number') {
          return item.updatedAt;
        }

        return 0;
      };

      processedData.sort((a: Quote, b: Quote) => {
        if (sortOrder === 'votesPoint_desc') {
          return (b.votesPoint || 0) - (a.votesPoint || 0);
        }
        else if (sortOrder === 'updatedAt_asc') {
          const timeA = getTimestamp(a);
          const timeB = getTimestamp(b);

          return timeA - timeB;
        }
        else if (sortOrder === 'updatedAt_desc') {
          const timeA = getTimestamp(a);
          const timeB = getTimestamp(b);

          return timeB - timeA;
        }
        return 0;
      });

      setQuotesToShow(QUOTES_PER_PAGE);
      setQuotes(processedData);
      // console.log("Process Data : ", processedData);
    } catch (err: any) {
      console.error('Error fetching quotes:', err);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูล Quote: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessQuotes();
  }, [sortOrder, filterVotes]);

  const handleEdit = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      setEditQuoteId(quoteId);
      setEditQuoteText(quote.qoute);
      setShowEditQuoteModal(true);
    }
  };

  const handleCancelEditQuote = () => {
    setShowEditQuoteModal(false);
    setEditQuoteId(null);
    setEditQuoteText('');
  };

  const handleConfirmEditQuote = async () => {
    if (editQuoteText.trim() && editQuoteId) {
      const access_token = localStorage.getItem('access_token');
      if (!access_token) {
        alert('ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่');
        return;
      }
      try {
        const response = await fetch(`http://localhost:3001/qoute/update/${editQuoteId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
          },
          body: JSON.stringify({ qoute: editQuoteText }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการแก้ไข Quote');
        }
        setShowEditQuoteModal(false);
        setEditQuoteId(null);
        setEditQuoteText('');
        fetchAndProcessQuotes();
      } catch (err: any) {
        setShowEditQuoteModal(false);
        setEditQuoteId(null);
        alert(`เกิดข้อผิดพลาด: คุณไม่ได้เป็นเจ้าของบทความ ไม่สามารถทำการแก้ไขได้`);
      }
    } else {
      alert('กรุณากรอกข้อความ Quote');
    }
  }

  const handleSearchClick = () => {
    fetchAndProcessQuotes();
  };

  const handleAddQuoteClick = () => {
    setShowAddQuoteModal(true);
    setNewQuoteText('');
  };

  const handleConfirmAddQuote = async () => {
    if (newQuoteText.trim()) {
      const access_token = localStorage.getItem('access_token');
      if (!access_token) {
        alert('ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่');
        return;
      }
      try {
        const response = await fetch('http://localhost:3001/qoute/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
          },
          body: JSON.stringify({ qoute: newQuoteText }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการเพิ่ม Quote');
        }
        setShowAddQuoteModal(false);
        setNewQuoteText('');
        fetchAndProcessQuotes();
      } catch (err: any) {
        alert(`เกิดข้อผิดพลาด: ${err.message}`);
      }
    } else {
      alert('กรุณากรอกข้อความ Quote');
    }
  };

  const handleCancelAddQuote = () => {
    setShowAddQuoteModal(false);
    setNewQuoteText('');
  };

  const handleLoadMore = () => {
    setQuotesToShow(prevCount => prevCount + QUOTES_PER_PAGE + 5);
  };

  const handleShowLess = () => {
    setQuotesToShow(QUOTES_PER_PAGE);
  };

  const handleDelete = (quoteId: string) => {
    setDeleteQuoteId(quoteId);
    setShowDeleteConfirmModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setDeleteQuoteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteQuoteId) return;
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      alert('ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/qoute/delete/${deleteQuoteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการโหวต');
      }
      setShowDeleteConfirmModal(false);
      setDeleteQuoteId(null);
      fetchAndProcessQuotes();
      alert('ลบสำเร็จ!');
    } catch (err: any) {
      setShowDeleteConfirmModal(false);
      setDeleteQuoteId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">กำลังโหลดรายการ Quote...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 p-4">
        <p className="text-xl text-red-700">ข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  const hasMoreQuotes = quotesToShow < quotes.length;
  const isShowingAll = quotesToShow >= quotes.length;

  return (
    <BackGroudApp>
      <div className="w-full max-w-5xl bg-white p-4 rounded-xl shadow-lg mb-9">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          รายการ คำคม
        </h1>

        <div className="mb-6 border-b pb-4 border-gray-200">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4 flex-grow">
              <div className="flex-1">
                <label htmlFor="search-key" className="block text-sm font-medium text-gray-700 mb-1">
                  ระบุคำค้นหา
                </label>
                <input
                  id="search-key"
                  type="text"
                  placeholder="เพิ่มคีย์เวิร์ด (Keyword)"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 text-gray-700"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>

              <div className="flex-1 md:flex-none md:w-48">
                <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                  เรียงลำดับ
                </label>
                <select
                  id="sort-order"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="updatedAt_desc">เรียงลำดับใหม่ - เก่า</option>
                  <option value="updatedAt_asc">เรียงลำดับเก่า - ใหม่</option>
                  <option value="votesPoint_desc">คะแนนโหวต (สูงสุด)</option>
                </select>
              </div>

              <div className="flex-1 md:flex-none md:w-48">
                <label htmlFor="filter-votes" className="block text-sm font-medium text-gray-700 mb-1">
                  กรองข้อมูล
                </label>
                <select
                  id="filter-votes"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={filterVotes}
                  onChange={(e) => setFilterVotes(e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="zero">คะแนนโหวต = 0</option>
                  <option value="greaterThanZero">คะแนนโหวต {'>'} 0</option>
                  <option value="greaterThanTwo">คะแนนโหวต {'>'} 2</option>
                </select>
              </div>

              <div className="md:self-end">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  ค้นหา
                </button>
              </div>
            </div>

            <div className="md:self-end">
              <button
                type="button"
                onClick={handleAddQuoteClick}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                เพิ่ม Quote ใหม่
              </button>
            </div>


          </div>
        </div>

        {quotes.length === 0 ? (
          <p className="text-center text-gray-600">ไม่พบคำคมใดๆ</p>
        ) : (
          <div className="space-y-4">
            {quotes.slice(0, quotesToShow).map((quote) => (
              <div key={quote.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-start justify-between">
                <div className="flex-grow pr-4 max-w-[calc(100%-80px)]">
                  <p className="text-gray-800 text-lg mb-2 leading-relaxed break-words">
                    "{quote.qoute}"
                  </p>
                  {quote.votesPoint !== undefined && (
                    <p className="text-gray-600 text-sm italic mt-1">
                      คะแนนโหวต: <span className="font-bold text-blue-600">{quote.votesPoint}</span>
                    </p>
                  )}
                </div>

                <div className="flex space-x-2 items-center flex-shrink-0">
                  <button
                    onClick={() => handleEdit(quote.id)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title="แก้ไข Quote"
                  >
                    <Edit className="w-6 h-6" color='#000000' />
                  </button>
                  <button
                    onClick={() => handleDelete(quote.id)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    title="ลบ Quote"
                  >
                    <Trash className="w-6 h-6" color='#000000' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {quotes.length > QUOTES_PER_PAGE && (
          <div className="flex justify-center mt-6">
            {hasMoreQuotes ? (
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-blue-400 text-white rounded-md shadow-md hover:bg-blue-500 transition-colors duration-200"
              >
                แสดง Quote เพิ่มเติม ({quotes.length - quotesToShow} รายการ)
              </button>
            ) : (
              <button
                onClick={handleShowLess}
                className="px-6 py-3 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition-colors duration-200"
              >
                แสดงน้อยลง
              </button>
            )}
          </div>
        )}

        {showAddQuoteModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-gray-700/60">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl min-w-[700px] relative">
              <button
                onClick={handleCancelAddQuote}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                title="ปิด"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">เพิ่ม Quote ใหม่</h2>
              <div className="mb-4">
                <textarea
                  id="new-quote-text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32 resize-none text-gray-800 placeholder-gray-500"
                  placeholder="พิมพ์ Quote ของคุณที่นี่..."
                  value={newQuoteText}
                  onChange={(e) => setNewQuoteText(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleCancelAddQuote}
                  className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddQuote}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditQuoteModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-gray-700/60">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl min-w-[700px] relative">
              <button
                onClick={handleCancelEditQuote}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                title="ปิด"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">แก้ไข Quote</h2>
              <div className="mb-4">
                <textarea
                  id="edit-quote-text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32 resize-none text-gray-800 placeholder-gray-500"
                  placeholder="แก้ไข Quote ของคุณที่นี่..."
                  value={editQuoteText}
                  onChange={(e) => setEditQuoteText(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEditQuote}
                  className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEditQuote}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-gray-700/60">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md min-w-[400px] text-center">
              <h2 className="text-xl font-bold text-black mb-4">ยืนยันการลบ</h2>
              <p className="mb-6 text-black">คุณต้องการลบคำคมนี้ใช่หรือไม่?</p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  ไม่
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  ใช่
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BackGroudApp>
  );
};

export default MainPage;
